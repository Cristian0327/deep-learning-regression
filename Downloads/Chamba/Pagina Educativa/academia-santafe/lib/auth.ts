import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AzureADProvider from 'next-auth/providers/azure-ad';


const providers = [];

// Solo agregar Google si está configurado
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Solo agregar Microsoft si está configurado
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  providers.push(
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      tenantId: process.env.MICROSOFT_TENANT_ID || 'common',
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.sub;
        session.user.email = token.email;
        
        // Intentar cargar desde Supabase
        let datosUsuario = null;
        try {
          const { data: userData, error } = await supabase
            .from('usuarios')
            .select('nombre, imagen, rol')
            .eq('id', token.sub)
            .single();

          if (userData && !error) {
            datosUsuario = userData;
          }
        } catch (error) {
          console.warn('Error cargando de Supabase:', error);
        }

        // Si Supabase funciona, usar esos datos
        if (datosUsuario) {
          session.user.name = datosUsuario.nombre;
          session.user.image = datosUsuario.imagen;
          session.user.role = datosUsuario.rol;
        } else {
          // Si no, usar los datos del token (que pueden venir de localStorage vía update)
          session.user.name = token.name;
          session.user.image = token.picture;
          session.user.role = token.role || 'student';
        }

        // Verificar si es admin (override)
        const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
        if (adminEmails.includes(session.user.email)) {
          session.user.role = 'admin';
        }
      }
      return session;
    },
    async jwt({ token, user, trigger, session, account }: any) {
      // Primera vez que el usuario inicia sesión (sign in)
      if (account && user) {
        token.id = user.id;
        token.email = user.email;
        
        // Determinar rol
        const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
        token.role = adminEmails.includes(user.email) ? 'admin' : 'student';
        
        // IMPORTANTE: Intentar cargar datos guardados desde archivo JSON local
        let datosGuardados = null;
        try {
          const fs = await import('fs');
          const path = await import('path');
          const dbFile = path.join(process.cwd(), 'data', 'users.json');
          
          if (fs.existsSync(dbFile)) {
            const dbContent = fs.readFileSync(dbFile, 'utf8');
            const db = JSON.parse(dbContent);
            if (db[token.sub]) {
              datosGuardados = db[token.sub];
            }
          }
        } catch (error) {
          console.warn('No se pudo cargar de archivo local:', error);
        }
        
        // Si hay datos guardados, usar esos; si no, usar los del OAuth
        if (datosGuardados) {
          token.name = datosGuardados.nombre;
          token.picture = datosGuardados.imagen;
          console.log('✅ Cargado perfil guardado:', token.name);
        } else {
          // Primera vez: usar datos del OAuth y GUARDAR
          token.name = user.name;
          token.picture = user.image;
          console.log('📝 Primera vez, usando datos de OAuth:', token.name);
          
          // Guardar automáticamente en users.json
          try {
            const fs = await import('fs');
            const path = await import('path');
            const dbFile = path.join(process.cwd(), 'data', 'users.json');
            
            let db = {};
            if (fs.existsSync(dbFile)) {
              const dbContent = fs.readFileSync(dbFile, 'utf8');
              db = JSON.parse(dbContent);
            } else {
              // Crear directorio si no existe
              const dataDir = path.join(process.cwd(), 'data');
              if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
              }
            }
            
            // Agregar el nuevo usuario
            db[token.sub] = {
              id: token.sub,
              nombre: user.name,
              imagen: user.image,
              email: user.email,
              rol: token.role,
              ultima_actualizacion: new Date().toISOString()
            };
            
            fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf8');
            console.log('💾 Usuario guardado en users.json:', user.name);
          } catch (error) {
            console.error('❌ Error al guardar usuario:', error);
          }
        }
      }
      
      // Si la sesión se está actualizando manualmente (desde update() en perfil)
      if (trigger === 'update' && session?.user) {
        // IMPORTANTE: Actualizar el token para que persista
        if (session.user.name) {
          token.name = session.user.name;
        }
        if (session.user.image) {
          token.picture = session.user.image;
        }
        console.log('🔄 Sesión actualizada con:', token.name);
      }
      
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false
      }
    },
  },
  useSecureCookies: false,
};
