import 'openai/shims/node';

// Mock básico do Request
global.Request = jest.fn().mockImplementation((input, init) => ({
  url: input,
  method: init?.method || 'GET',
  headers: new Headers(init?.headers),
  body: init?.body,
})) as unknown as typeof Request;

// Mock básico do Response
global.Response = jest.fn().mockImplementation((body, init) => ({
  body,
  headers: new Headers(init?.headers),
  status: init?.status || 200,
  ok: init?.status ? init.status >= 200 && init.status < 300 : true,
})) as unknown as typeof Response;

// Mock do Headers
global.Headers = jest.fn().mockImplementation((init) => {
  const headers = new Map();
  if (init) {
    Object.entries(init).forEach(([key, value]) => headers.set(key, value));
  }
  return {
    get: (key: string) => headers.get(key),
    set: (key: string, value: string) => headers.set(key, value),
    has: (key: string) => headers.has(key),
  };
}) as unknown as typeof Headers;

// Mock do TextEncoder
global.TextEncoder = jest.fn().mockImplementation(() => ({
  encode: jest.fn((str: string) => new Uint8Array(str.split('').map((char: string) => char.charCodeAt(0)))),
}));

// Mock do TextDecoder
global.TextDecoder = jest.fn().mockImplementation(() => ({
  decode: jest.fn((arr: Uint8Array) => String.fromCharCode.apply(null, Array.from(arr))),
})); 