export const SCREEN_NAMES: Record<string, string> = {
  '/': 'Home',
  '/blueprint': 'Blueprint',
  '/ballot': 'Ballot',
  '/login': 'Login',
  '/register': 'Register',
};

export function getScreenName(pathname: string, screenLabel?: string): string {
  return screenLabel || SCREEN_NAMES[pathname] || pathname;
}
