export async function apiJson<T>(url:string){const r=await fetch(url); if(!r.ok) throw new Error(await r.text()); return r.json() as Promise<T>;}
export function emojiFromCondition(id:number){ if(id>=200&&id<300) return '⛈️'; if(id>=300&&id<600) return '🌧️'; if(id===800) return '☀️'; if(id>800) return '☁️'; return '🌡️';}
