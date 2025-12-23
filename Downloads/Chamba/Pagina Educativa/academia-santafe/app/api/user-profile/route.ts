import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'users.json');

// Asegurar que existe el directorio y archivo
function ensureDbFile() {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({}), 'utf8');
  }
}

// Leer base de datos
function readDb(): Record<string, any> {
  ensureDbFile();
  const content = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(content);
}

// Escribir base de datos
function writeDb(data: Record<string, any>) {
  ensureDbFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// GET - Obtener perfil de usuario
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const db = readDb();
  const userProfile = db[session.user.id];

  if (userProfile) {
    return NextResponse.json(userProfile);
  } else {
    return NextResponse.json({ 
      nombre: session.user.name,
      imagen: session.user.image,
      email: session.user.email
    });
  }
}

// POST - Guardar perfil de usuario
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await request.json();
  const { nombre, imagen } = body;

  const db = readDb();
  
  db[session.user.id] = {
    id: session.user.id,
    nombre: nombre || session.user.name,
    imagen: imagen || session.user.image,
    email: session.user.email,
    rol: session.user.role || 'student',
    ultima_actualizacion: new Date().toISOString()
  };

  writeDb(db);

  return NextResponse.json({ success: true, data: db[session.user.id] });
}
