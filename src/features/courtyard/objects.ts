import type {Language} from '../../utils/gameplay'
export const courtyardObjects = [
  {
    id: 'doorLight',
    chapter: 0,
    name: {zh: '门灯', en: 'Door light'},
    description: {
      zh: '灯照着门槛，照亮来时的路，也容得下各自回屋的夜晚。',
      en: 'The lamp lights the doorstep: a way in, and room for everyone to return to their own evening.',
    },
  },
  {
    id: 'mint',
    chapter: 1,
    name: {zh: '薄荷', en: 'Mint'},
    description: {
      zh: '花盆挪到了有下午阳光的墙角。照顾从看见现在的需要开始。',
      en: 'The pot has moved to a corner with afternoon sun. Care begins with noticing what is needed now.',
    },
  },
  {
    id: 'window',
    chapter: 2,
    name: {zh: '铜把手', en: 'Brass handle'},
    description: {
      zh: '新窗隔住冷风，旧铜把手留在手边。记忆不必连同旧日的不便一起保留。',
      en: 'The new window keeps out draughts; the old brass handle remains within reach. A memory can stay without its discomfort.',
    },
  },
  {
    id: 'chairs',
    chapter: 3,
    name: {zh: '两把木椅', en: 'Two wooden chairs'},
    description: {
      zh: '一把朝向窗外，另一把留在桌边。不必坐成一样，也能在一起。',
      en: 'One faces the window, the other stays beside the table. There is room to be together while facing different ways.',
    },
  },
  {
    id: 'mendedCloth',
    chapter: 4,
    name: {zh: '补好的桌布', en: 'Mended tablecloth'},
    description: {
      zh: '角上留着浅绿色的歪线。陶姨有自己的合唱课，这块布也不等谁来验收。',
      en: 'A crooked pale-green seam remains at the corner. Auntie Tao has choir to go to; this cloth needs no inspection.',
    },
  },
  {
    id: 'windChime',
    chapter: 5,
    name: {zh: '木片风铃', en: 'Wooden wind chime'},
    description: {
      zh: '薄木片来自姐姐的工作室，风来时轻轻碰一下。来住一晚，也是一种回来。',
      en: 'Thin offcuts came from Lin Zhao’s studio. They touch softly in the breeze. Staying one night is a way of coming back, too.',
    },
  },
  {
    id: 'doorNote',
    chapter: 6,
    name: {zh: '门上的纸牌', en: 'Note on the door'},
    description: {
      zh: '“来前说一声，给你留座。”小纸牌写的是具体约定，不是谁随时待命的承诺。',
      en: '“Let us know before you come. We’ll save you a seat.” The little note holds an agreement, not a promise to be always available.',
    },
  },
  {
    id: 'windowLight',
    chapter: 7,
    name: {zh: '窗里的灯', en: 'Window light'},
    description: {
      zh: '门灯还亮着，屋里的事也在继续。下一次见面有了约定，今晚仍属于自己。',
      en: 'The door light stays on, and life indoors continues. Another visit is planned; this evening still belongs to oneself.',
    },
  },
] as const
export type CourtyardObjectId = (typeof courtyardObjects)[number]['id']
export function objectIsAvailable(
  id: string,
  unlockedThrough: number,
): id is CourtyardObjectId {
  return courtyardObjects.some(
    (o) => o.id === id && o.chapter <= unlockedThrough,
  )
}
export function objectName(id: CourtyardObjectId, lang: Language): string {
  return courtyardObjects.find((o) => o.id === id)!.name[lang]
}
