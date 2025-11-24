import { invokeLLM } from "./_core/llm";

export async function generateChatbotResponse(userMessage: string): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em tecnologia. Responda perguntas sobre tecnologia, inovação, IA, computação quântica, energia renovável e outros tópicos tech de forma clara, concisa e informativa. Mantenha as respostas em português brasileiro.",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    if (response.choices && response.choices.length > 0) {
      const content = response.choices[0].message.content;
      return typeof content === "string" ? content : "Desculpe, não consegui processar sua pergunta.";
    }

    return "Desculpe, não consegui gerar uma resposta.";
  } catch (error) {
    console.error("[Chatbot] Error generating response:", error);
    return "Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente mais tarde.";
  }
}
