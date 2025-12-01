import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Se não há variáveis configuradas, apenas adiciona headers de segurança
  if (!supabaseUrl || !supabaseAnonKey) {
    addSecurityHeaders(response);
    return response;
  }

  // Criar cliente Supabase para o middleware
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: any) {
        request.cookies.set({
          name,
          value: '',
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value: '',
          ...options,
        });
      },
    },
  });

  const { pathname } = request.nextUrl;

  // Rotas públicas
  const publicRoutes = ['/', '/login', '/cliente', '/setup-usuarios'];
  const isPublicRoute = publicRoutes.includes(pathname) || 
                        pathname.startsWith('/login') || 
                        pathname.startsWith('/auth/login') ||
                        pathname.startsWith('/cliente') ||
                        pathname.startsWith('/setup-usuarios');

  if (isPublicRoute) {
    addSecurityHeaders(response);
    return response;
  }

  // Rotas protegidas - verificar autenticação
  if (pathname.startsWith('/admin') || pathname.startsWith('/vendedor')) {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirect', pathname);
        redirectUrl.searchParams.set('error', encodeURIComponent('Faça login para continuar'));
        addSecurityHeaders(response);
        return NextResponse.redirect(redirectUrl);
      }

      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('users_profile')
        .select('role, is_active')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();

      if (profileError || !profile || !profile.is_active) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('error', encodeURIComponent('Acesso negado'));
        addSecurityHeaders(response);
        return NextResponse.redirect(redirectUrl);
      }

      // Verificar se o role corresponde à rota
      if (pathname.startsWith('/admin') && profile.role !== 'admin') {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('error', encodeURIComponent('Acesso negado. Área exclusiva para administradores.'));
        addSecurityHeaders(response);
        return NextResponse.redirect(redirectUrl);
      }

      if (pathname.startsWith('/vendedor') && profile.role !== 'vendedor') {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('error', encodeURIComponent('Acesso negado. Área exclusiva para vendedores.'));
        addSecurityHeaders(response);
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('Middleware error:', error);
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('error', encodeURIComponent('Erro ao verificar autenticação'));
      addSecurityHeaders(response);
      return NextResponse.redirect(redirectUrl);
    }
  }

  addSecurityHeaders(response);
  return response;
}

function addSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)',
  ],
};
