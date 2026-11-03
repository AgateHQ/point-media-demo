import storiesData from './stories.json';
import { richTextText, type EditionContent, type RichTextDocument } from './editionContent';
export interface Story {id:string; tag:string; title:string; subtitle:string; body:string; expandedBody:string; image:string; takeaway:string; richText?:RichTextDocument; imageAlt?:string; videoUrl?:string; date?:string}
export const stories:Story[] = [...storiesData];
export const readerContext: { preview: EditionContent | null; publicationId: string; assetBase?: string } = { preview: null, publicationId: 'the-scoop' };

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
  header: string;
  canvas: string;
  logoUrl?: string;
  theme?: string;
  headerInk?: string;
}
export const publications:Publication[] = [
  {id:'the-scoop',name:'The Scoop',subtitle:"BRITAIN'S CHEEKIEST READ",storyOrder:[0,1,2,3,4,5,6,7],color:'#FFFBEB',accent:'#DC2626',brand:'#DC2626',ink:'#111111',brandInk:'#ffffff',header:'#DC2626',canvas:'#f4dedb'},
  {id:'brightwire',name:'Brightwire',subtitle:'GADGETS, APPS & THE TECH YOU LIVE WITH',storyOrder:[1,4,6,3,0,7,5,2],color:'#fffaf5',accent:'#C2410C',brand:'#C2410C',ink:'#141414',brandInk:'#ffffff',header:'#141414',canvas:'#f2e5da'},
  {id:'full-time',name:'Full Time',subtitle:'EVERY GAME. EVERY RESULT.',storyOrder:[2,0,5,3,7,1,4,6],color:'#F0F7F8',accent:'#FACC15',brand:'#0E7490',ink:'#0B1F26',brandInk:'#0B1F26',header:'#0E7490',canvas:'#dcecef'},
  {id:'evening-lantern',name:'The Evening Lantern',subtitle:"LIGHT ON THE DAY'S NEWS",storyOrder:[3,5,0,7,2,6,1,4],color:'#f7f7ee',accent:'#1E4D2B',brand:'#1E4D2B',ink:'#1E4D2B',brandInk:'#ffffff',header:'#1E4D2B',canvas:'#e1e8db'},
  {id:'northgate-ledger',name:'The Northgate Ledger',subtitle:'RELIABLE REPORTING, EVERY EDITION',storyOrder:[5,0,3,7,2,6,1,4],color:'#f8f9fc',accent:'#14284B',brand:'#14284B',ink:'#14284B',brandInk:'#ffffff',header:'#14284B',canvas:'#e1e6ef'},
  {id:'pitchline',name:'Pitchline',subtitle:'MEDIA · MARKETING · ADTECH',storyOrder:[4,1,0,5,6,3,7,2],color:'#f8f5ff',accent:'#5B21B6',brand:'#5B21B6',ink:'#15132B',brandInk:'#ffffff',header:'#15132B',canvas:'#e7e0f3'},
];
export const legacyPublicationIds:Record<string,string> = {'the-point':'the-scoop',afterhours:'brightwire',touchline:'full-time',pulse:'evening-lantern'};
export function publicationLogo(pub:Publication,variant:'colour'|'white'|'icon'='colour'){return pub.logoUrl || `${readerContext.assetBase || import.meta.env.BASE_URL}newspaper-logos/${pub.id}/${pub.id}_${variant==='icon'?'icon':`logo_${variant}`}.svg`;}
export function nextPublicationId(id:string){const index=publications.findIndex(p=>p.id===id);return publications[(index+1)%publications.length].id;}

export function articlePreview(story:Story){const full=story.expandedBody;const target=Math.floor(full.length*.4);const sentenceEnd=full.lastIndexOf('. ',target);const cut=sentenceEnd>=target*.8?sentenceEnd+1:full.lastIndexOf(' ',target);return full.slice(0,cut>0?cut:target).trim();}
export const storySections:Record<string,string>={city:'News',music:'Culture',sport:'Sport',life:'Lifestyle',culture:'Arts',local:'Community',weekend:'Travel',last:'Perspective'};
export function youtubeEmbed(videoId:string){const origin=encodeURIComponent(window.location.origin);return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&disablekb=1&fs=0&iv_load_policy=3&playsinline=1&rel=0&enablejsapi=1&origin=${origin}&widget_referrer=${origin}`;}
export const asset=(p:string)=>`${readerContext.assetBase || import.meta.env.BASE_URL}images/${p}`;
export const storyVideos:Record<string,string>={'brightwire:music':'CftLBPI1Ga4','evening-lantern:life':'JTHRGI2h45U'};
export const adGradients=['#ff9a8b,#ff6a88','#a1c4fd,#c2e9fb','#fbc2eb,#a6c1ee','#84fab0,#8fd3f4','#f6d365,#fda085','#a18cd1,#fbc2eb'];
export const money=(n:number)=>`£${(n/100).toFixed(2)}`;

const demoPublications = [...publications];
export function configureEditionPreview(content: EditionContent, assetBase: string) {
  const slug = content.publication.name.toLowerCase().replace(/^the\s+/, '').replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
  const theme = demoPublications.find(pub => pub.name === content.publication.name || pub.id === slug || pub.id === `the-${slug}`) || demoPublications[0];
  const id = `cms-edition-${content.id}`;
  const mapped = content.articles.map((article): Story => ({
    id: `cms-article-${article.id}`, title: article.title, tag: 'IN THIS EDITION', subtitle: '', body: '',
    expandedBody: richTextText(article.body.root), takeaway: '', image: article.imageUrl || '', imageAlt: article.imageAlt,
    videoUrl: article.videoUrl, richText: article.body, date: content.startDate,
  }));
  stories.splice(0, stories.length, ...storiesData, ...mapped);
  publications.splice(0, publications.length, ...demoPublications, {
    ...theme, id, name: content.publication.name, subtitle: content.publication.headline,
    storyOrder: mapped.map((_, index) => storiesData.length + index),
    logoUrl: content.publication.logoUrl, theme: theme.id, header: '#ffffff', headerInk: '#111111',
  });
  readerContext.preview = content;
  readerContext.publicationId = id;
  readerContext.assetBase = assetBase;
}
