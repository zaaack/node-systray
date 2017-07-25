import { Struct, setIn } from 'immuter'

let struct = Struct({
  title: {
    zh: '哈利·波特与魔法石',
    en: 'Harry Potter and the Philosopher\'s Stone',
  },
  author: 'J. k. rowling',
  tags: ['novel', 'magic'],
})

struct = struct.clone(s => {
  s.author = 'New Author'
  s.title.en = 'New Title!'
})

struct = setIn(struct, _ => _.title.zh)("")
