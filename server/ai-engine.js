const https = require('https');

class AIEngine {
  constructor(apiKey, provider = 'gemini') {
    this.apiKey = apiKey;
    this.provider = provider;
  }

  async callAI(prompt, systemPrompt = '') {
    if (this.provider === 'gemini') {
      return this.callGemini(prompt, systemPrompt);
    } else {
      return this.callGroq(prompt, systemPrompt);
    }
  }

  async callGemini(prompt, systemPrompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;

    const body = JSON.stringify({
      contents: [{
        parts: [{ text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      }
    });

    return new Promise((resolve, reject) => {
      const req = https.request(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              // Fallback to Groq if Gemini fails
              if (this.provider === 'gemini') {
                this.provider = 'groq';
                return this.callGroq(prompt, systemPrompt).then(resolve).catch(reject);
              }
              return reject(new Error(parsed.error.message));
            }
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
            resolve(text);
          } catch (e) {
            reject(e);
          }
        });
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  async callGroq(prompt, systemPrompt) {
    const url = 'https://api.groq.com/openai/v1/chat/completions';

    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const body = JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 8192,
    });

    return new Promise((resolve, reject) => {
      const req = https.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) return reject(new Error(parsed.error.message));
            resolve(parsed.choices?.[0]?.message?.content || '');
          } catch (e) {
            reject(e);
          }
        });
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  async generateCode(prompt) {
    const systemPrompt = `You are an expert web developer. Generate production-ready HTML/CSS/JavaScript code.
Output ONLY the code, no explanations. The code must be complete and self-contained in a single HTML file.
Include responsive design, modern CSS, and clean JavaScript. Support all screen sizes.`;

    const code = await this.callAI(prompt, systemPrompt);
    return {
      code: this.extractCode(code),
      filename: 'index.html',
      language: 'html'
    };
  }

  async debugCode(code, errorDescription) {
    const systemPrompt = `You are an expert debugger. Fix the code and return ONLY the corrected code, no explanations.`;
    const prompt = `Fix this code. Error: ${errorDescription || 'Unknown error'}\n\nCode:\n${code}`;

    const fixed = await this.callAI(prompt, systemPrompt);
    return {
      code: this.extractCode(fixed),
      filename: 'index.html',
      language: 'html',
      task: 'debug'
    };
  }

  async convertToFlutter(code, description) {
    const systemPrompt = `You are an expert Flutter developer. Convert web code to Flutter Dart code.
Output ONLY the Flutter widget code, ready to use in a Flutter app.`;
    const prompt = `Convert this to Flutter:\n${description}\n\nCode:\n${code}`;

    const dart = await this.callAI(prompt, systemPrompt);
    return {
      code: this.extractCode(dart),
      filename: 'lib/generated_screen.dart',
      language: 'dart',
      task: 'convert'
    };
  }

  async enhanceCode(code, filename) {
    const systemPrompt = `You are an expert developer. Enhance and optimize this code. 
Fix bugs, improve performance, add error handling, and improve the UI.
Return ONLY the enhanced code, no explanations.`;
    const prompt = `Enhance this ${filename} file:\n\n${code}`;

    const enhanced = await this.callAI(prompt, systemPrompt);
    return {
      code: this.extractCode(enhanced),
      filename: filename,
      task: 'enhance'
    };
  }

  async signalAnalysis(code) {
    const systemPrompt = `You are a code analysis expert. Analyze the code for:
1. Bugs and errors
2. Performance issues
3. Security vulnerabilities
4. Best practice violations
5. Improvement suggestions
Return a structured JSON analysis.`;
    const prompt = `Analyze this code:\n\n${code}`;

    const analysis = await this.callAI(prompt, systemPrompt);
    return {
      analysis,
      task: 'signal'
    };
  }

  extractCode(response) {
    // Try to extract code from markdown code blocks
    const patterns = [
      /```(?:html|dart|css|js|javascript|flutter)?\n([\s\S]*?)```/,
      /```([\s\S]*?)```/,
    ];

    for (const pattern of patterns) {
      const match = response.match(pattern);
      if (match) return match[1].trim();
    }

    // If no code block found, check if the entire response looks like code
    if (response.includes('<!DOCTYPE') || response.includes('<html') || 
        response.includes('class ') || response.includes('import ') ||
        response.includes('<style') || response.includes('function ')) {
      return response.trim();
    }

    return response.trim();
  }
}

module.exports = AIEngine;
