import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { contenidoCurso, tiposPreguntas } = await request.json();

    // Verificar que tenemos API key de OpenAI
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key de OpenAI no configurada' },
        { status: 500 }
      );
    }

    // Calcular total de preguntas
    const totalPreguntas = 
      (tiposPreguntas.opcion2 || 0) +
      (tiposPreguntas.opcion3 || 0) +
      (tiposPreguntas.opcion4 || 0) +
      (tiposPreguntas.opcion5 || 0);

    if (totalPreguntas === 0) {
      return NextResponse.json(
        { error: 'Debes especificar al menos una pregunta' },
        { status: 400 }
      );
    }

    // Construir el prompt para OpenAI
    const prompt = `Eres un experto en educación y evaluación. Genera preguntas de opción múltiple basadas en el siguiente contenido del curso:

CONTENIDO DEL CURSO:
${contenidoCurso}

INSTRUCCIONES:
Genera exactamente ${totalPreguntas} preguntas distribuidas así:
${tiposPreguntas.opcion2 > 0 ? `- ${tiposPreguntas.opcion2} pregunta(s) con 2 opciones` : ''}
${tiposPreguntas.opcion3 > 0 ? `- ${tiposPreguntas.opcion3} pregunta(s) con 3 opciones` : ''}
${tiposPreguntas.opcion4 > 0 ? `- ${tiposPreguntas.opcion4} pregunta(s) con 4 opciones` : ''}
${tiposPreguntas.opcion5 > 0 ? `- ${tiposPreguntas.opcion5} pregunta(s) con 5 opciones` : ''}

FORMATO DE RESPUESTA (JSON):
Responde ÚNICAMENTE con un array JSON válido sin texto adicional. Cada pregunta debe tener esta estructura exacta:
{
  "id": "numero único",
  "tipo": "multiple",
  "pregunta": "texto de la pregunta",
  "opciones": ["opción 1", "opción 2", ...],
  "respuestaCorrecta": índice de la respuesta correcta (0-based),
  "retroalimentacion": "explicación breve de por qué es correcta"
}

REQUISITOS IMPORTANTES:
1. Las preguntas deben ser claras y estar directamente relacionadas con el contenido
2. Las opciones incorrectas deben ser plausibles pero claramente incorrectas
3. La retroalimentación debe explicar por qué la respuesta es correcta
4. Responde SOLO con el array JSON, sin markdown, sin explicaciones adicionales
5. Asegúrate de que el JSON sea válido y parseable`;

    // Llamar a OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en educación que genera preguntas de evaluación de alta calidad. Respondes ÚNICAMENTE con JSON válido, sin texto adicional.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error de OpenAI:', errorData);
      return NextResponse.json(
        { error: 'Error al comunicarse con OpenAI', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const contenidoRespuesta = data.choices[0].message.content;

    // Limpiar la respuesta por si viene con markdown
    let preguntasTexto = contenidoRespuesta.trim();
    if (preguntasTexto.startsWith('```json')) {
      preguntasTexto = preguntasTexto.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (preguntasTexto.startsWith('```')) {
      preguntasTexto = preguntasTexto.replace(/```\n?/g, '');
    }

    // Parsear las preguntas
    const preguntas = JSON.parse(preguntasTexto);

    // Validar que sea un array
    if (!Array.isArray(preguntas)) {
      return NextResponse.json(
        { error: 'La respuesta de OpenAI no es un array válido' },
        { status: 500 }
      );
    }

    // Asignar IDs únicos si no los tienen
    const preguntasConId = preguntas.map((pregunta, index) => ({
      ...pregunta,
      id: pregunta.id || `ia-${Date.now()}-${index}`
    }));

    return NextResponse.json({
      preguntas: preguntasConId,
      total: preguntasConId.length
    });

  } catch (error) {
    console.error('Error en generar-preguntas:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
