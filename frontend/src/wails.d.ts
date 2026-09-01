declare module '@wailsapp/runtime' {
  export function BrowserOpenURL(url: string): Promise<void>;
  export function Environment(): Promise<{
    platform: string;
    arch: string;
    debug: boolean;
  }>;
  export function OpenFileDialog (options?: {
    title?: string;
    filters?: { name: string; extensions: string[] }[];
  }): Promise<string>;
  // Agrega aquí otras funciones del runtime que utilices en tu app
}