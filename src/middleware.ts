import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function getProjectRef(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return url.match(/https:\/\/([^.]+)\./)?.[1] ?? '';
}

function injectTokenFromHeader(request: NextRequest): void {
  const token = request.headers.get('x-sb-token');
  if (!token) return;
  const hasCookie = request.cookies.getAll().some((c) => c.name.includes('auth-token'));
  if (hasCookie) return;
  request.cookies.set(`sb-${getProjectRef()}-auth-token`, token);
}

// Routes that require authentication (any role)
const PROTECTED_ROUTES = [
  '/unified-inbox',
  '/farmer/rentals',
  '/account',
  '/rental-payment',
  '/rental-return',
  '/order-confirmation',
  '/booking-confirmation',
  '/messages',
  '/inbox',
  '/browse-equipment',
];

// Routes that require supplier/provider role only
const SUPPLIER_ONLY_ROUTES = [
  '/supplier/hub',
  '/supplier/dashboard',
  '/supplier/add-listing',
  '/supplier/operations',
  '/supplier/location-picker',
  '/provider-equipment',
];

// Routes that require farmer/buyer role only
const FARMER_ONLY_ROUTES = [
  '/farmer/rentals',
];

export async function middleware(request: NextRequest) {
  injectTokenFromHeader(request);
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Check if route requires authentication
  const requiresAuth = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const requiresSupplier = SUPPLIER_ONLY_ROUTES.some((route) => pathname.startsWith(route));
  const requiresFarmer = FARMER_ONLY_ROUTES.some((route) => pathname.startsWith(route));

  // Not authenticated — redirect to login
  if (!user && (requiresAuth || requiresSupplier || requiresFarmer)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated — check role-based access
  if (user && (requiresSupplier || requiresFarmer)) {
    // Fetch role from user_profiles
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, is_provider')
      .eq('id', user.id)
      .maybeSingle();

    const role = profile?.role || user.user_metadata?.role || 'buyer';
    const isSupplier = role === 'supplier' || role === 'provider' || profile?.is_provider === true;
    const isFarmer = role === 'farmer' || role === 'buyer';

    if (requiresSupplier && !isSupplier) {
      // Farmer trying to access supplier pages → redirect to farmer dashboard
      const url = request.nextUrl.clone();
      url.pathname = '/unified-inbox';
      url.searchParams.set('error', 'supplier_only');
      return NextResponse.redirect(url);
    }

    if (requiresFarmer && !isFarmer) {
      // Supplier trying to access farmer-only pages → redirect to supplier hub
      const url = request.nextUrl.clone();
      url.pathname = '/supplier/hub';
      url.searchParams.set('error', 'farmer_only');
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
