import storiesData from './stories.json';
export interface Story {id:string; tag:string; title:string; subtitle:string; body:string; expandedBody:string; image:string; takeaway:string}
export const stories:Story[] = storiesData;

export interface Publication {
  id: string;
  name: string;
  subtitle: string;
  storyOrder: number[];
  color: string;
  accent: string;
  brand: string;
  ink: string;
  brandInk: string;
}
export const publications:Publication[] = [
  {id:'the-point',name:'the daily trail',subtitle:'A LITTLE PERSPECTIVE. EVERY DAY.',storyOrder:[0,1,2,3,4,5,6,7],color:'#052962',accent:'#ffffff',brand:'#052962',ink:'#ffffff',brandInk:'#ffffff'},
  {id:'afterhours',name:'the mirrorball',subtitle:'CULTURE WORTH STAYING UP FOR.',storyOrder:[1,4,6,3,0,7,5,2],color:'#ffffff',accent:'#111111',brand:'#111111',ink:'#111111',brandInk:'#ffffff'},
  {id:'touchline',name:'the offside times.',subtitle:'BEYOND THE FINAL WHISTLE.',storyOrder:[2,0,5,3,7,1,4,6],color:'#0b1f3a',accent:'#ffffff',brand:'#0b1f3a',ink:'#ffffff',brandInk:'#ffffff'},
  {id:'pulse',name:'the evening substandard',subtitle:'THE CITY\'S HEARTBEAT.',storyOrder:[3,5,0,7,2,6,1,4],color:'#fff1e5',accent:'#111111',brand:'#fff1e5',ink:'#111111',brandInk:'#111111'},
];
export function nextPublicationId(id:string){const index=publications.findIndex(p=>p.id===id);return publications[(index+1)%publications.length].id;}

export function articlePreview(story:Story){const full=story.expandedBody;const target=Math.floor(full.length*.75);const sentenceEnd=full.lastIndexOf('. ',target);const cut=sentenceEnd>=target*.8?sentenceEnd+1:full.lastIndexOf(' ',target);return full.slice(0,cut>0?cut:target).trim();}
export function initials(name:string){const words=name.replace(/[^a-zA-Z\s]/g,'').split(/\s+/).filter(w=>w && w.toLowerCase()!=='the');const source=words.length?words:name.split(/\s+/);return source.length===1?source[0].slice(0,2).toUpperCase():source.slice(0,2).map(w=>w[0]).join('').toUpperCase();}
export function youtubeEmbed(videoId:string){const origin=encodeURIComponent(window.location.origin);return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&disablekb=1&fs=0&iv_load_policy=3&playsinline=1&rel=0&enablejsapi=1&origin=${origin}&widget_referrer=${origin}`;}
export const asset=(p:string)=>`${import.meta.env.BASE_URL}images/${p}`;
export const storyVideos:Record<string,string>={'afterhours:music':'CftLBPI1Ga4','pulse:life':'JTHRGI2h45U'};
export const adGradients=['#ff9a8b,#ff6a88','#a1c4fd,#c2e9fb','#fbc2eb,#a6c1ee','#84fab0,#8fd3f4','#f6d365,#fda085','#a18cd1,#fbc2eb'];
export const money=(n:number)=>`£${(n/100).toFixed(2)}`;
