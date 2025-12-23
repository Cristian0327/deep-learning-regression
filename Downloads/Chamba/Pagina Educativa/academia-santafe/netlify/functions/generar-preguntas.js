const { Configuration, OpenAIApi } = require('openai');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
    const { contenidoCurso, tiposPreguntas } = JSON.parse(event.body);

    if (!contenidoCurso) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'contenidoCurso es requerido' })
      };
    }

    if (!tiposPreguntas) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'tiposPreguntas es requerido' })
      };
    }

    // Calcular total de preguntas
    const totalPreguntas = 
      (tiposPreguntas.opcion2 || 0) + 
      (tiposPreguntas.opcion3 || 0) + 
      (tiposPreguntas.opcion4 || 0) + 
      (tiposPreguntas.opcion5 || 0);

    if (totalPreguntas === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Debes especificar al menos una pregunta' })
      };
    }

    // Configurar OpenAI (usa variable de entorno OPENAI_API_KEY)
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    // Prompt para generar preguntas con tipos específicos y dificultad mezclada
    const instruccionesTipos = [];
    if (tiposPreguntas.opcion2 > 0) {
      instruccionesTipos.push(`${tiposPreguntas.opcion2} preguntas con 2 opciones (Verdadero/Falso o A/B)`);
    }
    if (tiposPreguntas.opcion3 > 0) {
      instruccionesTipos.push(`${tiposPreguntas.opcion3} preguntas con 3 opciones (A, B, C)`);
    }
    if (tiposPreguntas.opcion4 > 0) {
      instruccionesTipos.push(`${tiposPreguntas.opcion4} preguntas con 4 opciones (A, B, C, D)`);
    }
    if (tiposPreguntas.opcion5 > 0) {
      instruccionesTipos.push(`${tiposPreguntas.opcion5} preguntas con 5 opciones (A, B, C, D, E)`);
    }

    const prompt = `
Eres un experto educador creando una evaluación de opción múltiple.

CONTENIDO DEL CURSO:
${contenidoCurso}

INSTRUCCIONES:
- Genera exactamente las siguientes preguntas:
  ${instruccionesTipos.join('\n  ')}
- MEZCLA niveles de dificultad automáticamente (algunas fáciles, algunas medias, algunas difíciles)
- Las preguntas deben extraerse del contenido del curso proporcionado
- Indica cuál es la respuesta correcta (índice empezando en 0)
- IMPORTANTE: Incluye una retroalimentación educativa que explique POR QUÉ la respuesta correcta es correcta y POR QUÉ las otras opciones son incorrectas

FORMATO JSON (responde SOLO con JSON válido):
[
  {
    "pregunta": "texto de la pregunta",
    "opciones": ["opción 1", "opción 2", ...],
    "respuestaCorrecta": 0,
    "retroalimentacion": "Explicación detallada de por qué la opción correcta es la correcta, y por qué las demás opciones son incorrectas."
  }
]

IMPORTANTE: El número de opciones en cada pregunta debe coincidir con lo solicitado.
`;

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Eres un asistente experto en crear evaluaciones educativas. Respondes SOLO en formato JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const respuestaIA = completion.data.choices[0].message.content;
    
    // Parsear la respuesta JSON
    let preguntas;
    try {
      preguntas = JSON.parse(respuestaIA);
    } catch (e) {
      // Si la IA no devolvió JSON válido, intentar extraerlo
      const jsonMatch = respuestaIA.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        preguntas = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('La IA no devolvió un formato JSON válido');
      }
    }

    // Agregar IDs únicos a cada pregunta
    const preguntasConId = preguntas.map((p, index) => ({
      id: `pregunta_${Date.now()}_${index}`,
      tipo: 'multiple',
      ...p
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        preguntas: preguntasConId,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Error generando preguntas:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Error al generar preguntas con IA',
        detalle: error.message 
      })
    };
  }
};
