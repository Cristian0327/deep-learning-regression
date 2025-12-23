import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dbFile = path.join(process.cwd(), 'data', 'users.json');
    
    if (!fs.existsSync(dbFile)) {
      return NextResponse.json({ count: 0 });
    }

    const fileContent = fs.readFileSync(dbFile, 'utf8');
    const db = JSON.parse(fileContent);
    
    // Contar el número de usuarios en el archivo
    const count = Object.keys(db).length;
    
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error al contar usuarios:', error);
    return NextResponse.json({ count: 0 });
  }
}
