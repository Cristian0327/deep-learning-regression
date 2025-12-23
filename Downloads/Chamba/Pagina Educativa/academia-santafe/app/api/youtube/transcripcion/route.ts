import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json(
      { error: 'videoId es requerido' },
      { status: 400 }
    );
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { 
        error: 'YouTube API key no configurada',
        message: 'Para habilitar transcripciones, configura YOUTUBE_API_KEY en .env.local'
      },
      { status: 500 }
    );
  }

  try {
    // Obtener lista de caption tracks
    const captionsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${apiKey}`
    );

    if (!captionsResponse.ok) {
      throw new Error('Error al obtener captions');
    }

    const captionsData = await captionsResponse.json();

    if (!captionsData.items || captionsData.items.length === 0) {
      return NextResponse.json(
        { 
          error: 'No hay subtítulos disponibles',
          message: 'Este video no tiene subtítulos habilitados. El instructor debe habilitar subtítulos en YouTube.'
        },
        { status: 404 }
      );
    }

    // Buscar caption en español o el primero disponible
    const spanishCaption = captionsData.items.find((item: any) => 
      item.snippet.language === 'es' || item.snippet.language === 'es-ES'
    );
    const captionId = spanishCaption?.id || captionsData.items[0].id;

    // Descargar el caption
    const captionResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/captions/${captionId}?tfmt=srt&key=${apiKey}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    if (!captionResponse.ok) {
      throw new Error('Error al descargar caption');
    }

    const captionText = await captionResponse.text();
    
    // Parsear SRT a segmentos
    const segments = parseSRT(captionText);

    return NextResponse.json({ segments });
  } catch (error) {
    console.error('Error en API de transcripción:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener transcripción',
        message: 'Ocurrió un error al intentar obtener la transcripción del video.'
      },
      { status: 500 }
    );
  }
}

function parseSRT(srtText: string) {
  const segments: Array<{ time: number; duration: number; text: string }> = [];
  const blocks = srtText.split('\n\n').filter(block => block.trim());

  blocks.forEach(block => {
    const lines = block.split('\n');
    if (lines.length >= 3) {
      const timeLine = lines[1];
      const text = lines.slice(2).join(' ');

      const timeMatch = timeLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
      
      if (timeMatch) {
        const startHours = parseInt(timeMatch[1]);
        const startMinutes = parseInt(timeMatch[2]);
        const startSeconds = parseInt(timeMatch[3]);
        const startMillis = parseInt(timeMatch[4]);

        const endHours = parseInt(timeMatch[5]);
        const endMinutes = parseInt(timeMatch[6]);
        const endSeconds = parseInt(timeMatch[7]);
        const endMillis = parseInt(timeMatch[8]);

        const startTime = startHours * 3600 + startMinutes * 60 + startSeconds + startMillis / 1000;
        const endTime = endHours * 3600 + endMinutes * 60 + endSeconds + endMillis / 1000;
        const duration = endTime - startTime;

        segments.push({
          time: startTime,
          duration: duration,
          text: text.replace(/<[^>]*>/g, '').trim()
        });
      }
    }
  });

  return segments;
}
