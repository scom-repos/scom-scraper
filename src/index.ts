export type IPageLifeCycle = 'domcontentloaded' | 'load' | 'networkidle0' | 'networkidle2';
export type IKeyboardAction = 'up' | 'down' | 'press' | 'sendCharacter';
export type IKeyInput = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'Power' | 'Eject' | 'Abort' | 'Help' | 'Backspace' | 'Tab' | 'Numpad5' | 'NumpadEnter' | 'Enter' | '\r' | '\n' | 'ShiftLeft' | 'ShiftRight' | 'ControlLeft' | 'ControlRight' | 'AltLeft' | 'AltRight' | 'Pause' | 'CapsLock' | 'Escape' | 'Convert' | 'NonConvert' | 'Space' | 'Numpad9' | 'PageUp' | 'Numpad3' | 'PageDown' | 'End' | 'Numpad1' | 'Home' | 'Numpad7' | 'ArrowLeft' | 'Numpad4' | 'Numpad8' | 'ArrowUp' | 'ArrowRight' | 'Numpad6' | 'Numpad2' | 'ArrowDown' | 'Select' | 'Open' | 'PrintScreen' | 'Insert' | 'Numpad0' | 'Delete' | 'NumpadDecimal' | 'Digit0' | 'Digit1' | 'Digit2' | 'Digit3' | 'Digit4' | 'Digit5' | 'Digit6' | 'Digit7' | 'Digit8' | 'Digit9' | 'KeyA' | 'KeyB' | 'KeyC' | 'KeyD' | 'KeyE' | 'KeyF' | 'KeyG' | 'KeyH' | 'KeyI' | 'KeyJ' | 'KeyK' | 'KeyL' | 'KeyM' | 'KeyN' | 'KeyO' | 'KeyP' | 'KeyQ' | 'KeyR' | 'KeyS' | 'KeyT' | 'KeyU' | 'KeyV' | 'KeyW' | 'KeyX' | 'KeyY' | 'KeyZ' | 'MetaLeft' | 'MetaRight' | 'ContextMenu' | 'NumpadMultiply' | 'NumpadAdd' | 'NumpadSubtract' | 'NumpadDivide' | 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'F9' | 'F10' | 'F11' | 'F12' | 'F13' | 'F14' | 'F15' | 'F16' | 'F17' | 'F18' | 'F19' | 'F20' | 'F21' | 'F22' | 'F23' | 'F24' | 'NumLock' | 'ScrollLock' | 'AudioVolumeMute' | 'AudioVolumeDown' | 'AudioVolumeUp' | 'MediaTrackNext' | 'MediaTrackPrevious' | 'MediaStop' | 'MediaPlayPause' | 'Semicolon' | 'Equal' | 'NumpadEqual' | 'Comma' | 'Minus' | 'Period' | 'Slash' | 'Backquote' | 'BracketLeft' | 'Backslash' | 'BracketRight' | 'Quote' | 'AltGraph' | 'Props' | 'Cancel' | 'Clear' | 'Shift' | 'Control' | 'Alt' | 'Accept' | 'ModeChange' | ' ' | 'Print' | 'Execute' | '\u0000' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z' | 'Meta' | '*' | '+' | '-' | '/' | ';' | '=' | ',' | '.' | '`' | '[' | '\\' | ']' | "'" | 'Attn' | 'CrSel' | 'ExSel' | 'EraseEof' | 'Play' | 'ZoomOut' | ')' | '!' | '@' | '#' | '$' | '%' | '^' | '&' | '(' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z' | ':' | '<' | '_' | '>' | '?' | '~' | '{' | '|' | '}' | '"' | 'SoftLeft' | 'SoftRight' | 'Camera' | 'Call' | 'EndCall' | 'VolumeDown' | 'VolumeUp';
export type ICookieSameSite = 'Strict' | 'Lax' | 'None';
export type ICookiePriority = 'Low' | 'Medium' | 'High';
export type ICookieSourceScheme = 'Unset' | 'NonSecure' | 'Secure';
export type IPageEvent = "close" | "console" | "domcontentloaded" | "frameattached" | "framedetached" | "framenavigated" | "load" | "metrics" | "pageerror" | "popup" | "requestservedfromcache" | "requestfailed" | "requestfinished" | "response" | "workercreated" | "workerdestroyed"

export interface ICookieParam {
    name: string;
    value: string;
    url?: string;
    domain?: string;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: ICookieSameSite;
    expires?: number;
    priority?: ICookiePriority;
    sameParty?: boolean;
    sourceScheme?: ICookieSourceScheme;
    partitionKey?: string;
}

export interface ICookie {
    name: string;
    value: string;
    domain: string;
    path: string;
    expires: number;
    size: number;
    httpOnly: boolean;
    secure: boolean;
    session: boolean;
    sameSite?: ICookieSameSite;
    priority?: ICookiePriority;
    sameParty?: boolean;
    sourceScheme?: ICookieSourceScheme;
    partitionKey?: string;
    partitionKeyOpaque?: boolean;
}

export interface IScraperEngine {
    init: () => Promise<void>;
    click: (selector: string) => Promise<void>;
    type: (selector: string, value: string, timeout?: number, delay?: number) => Promise<void>;
    goTo: (url: string, timeout?: number, waitUntil?: IPageLifeCycle | IPageLifeCycle[]) => Promise<any>;
    waitForNavigation: (timeout?: number, waitUntil?: IPageLifeCycle | IPageLifeCycle[]) => Promise<any>;
    waitForSelector: (selector: string, timeout?: number) => Promise<any>;
    scrollToBottom: (delay?: number) => Promise<void>;
    waitForRequest: (urlOrPredict: string | ((response: any) => Promise<boolean>)) => Promise<any>;
    waitForResponse: (urlOrPredict: string | ((response: any) => Promise<boolean>)) => Promise<any>;
    removeAllListener: (eventType?: IPageEvent) => void;
    on: (event: IPageEvent, callback: (response: any) => Promise<any>) => void;
    getCookies: () => Promise<ICookie[]>;
    setCookie: (...cookies: ICookie[]) => Promise<void>;
    destroy: () => Promise<void>
}