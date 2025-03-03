import type { PromptOptions } from '~/lib/common/prompt-library';

// Salva o prompt no localStorage usando a mesma chave 'bolt_custom_prompt' usada no CustomPromptEditor
export function saveCustomPrompt(prompt: string) {
  localStorage.setItem('bolt_custom_prompt', prompt);
}

// Remove o prompt e retorna uma string vazia, para poder atualizar o estado no CustomPromptEditor
export function resetCustomPrompt(): string {
  localStorage.removeItem('bolt_custom_prompt');
  return '';
}

// Export default para obter o prompt atual: se inexistente, usa o texto padrão
export default (options: PromptOptions) => {
  const { cwd, allowedHtmlElements } = options;
  const customPrompt = localStorage.getItem('bolt_custom_prompt') || '';

  if (!customPrompt) {
    return `You are an AI programming assistant. Follow the user's requirements carefully & to the letter.
Current working directory: ${cwd}

Available HTML elements for formatting: ${allowedHtmlElements.join(', ')}`;
  }

  return customPrompt
    .replace('${cwd}', cwd)
    .replace('${allowedHtmlElements}', allowedHtmlElements.join(', '));
};