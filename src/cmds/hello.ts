import { CodeWriter } from '../writer'

export function hello( wr : CodeWriter ) {
  console.log('Hello was called with ', wr.getState().message)
  wr.getFileWriter('/', 'hello.md').out(wr.getState().message, true)
}

export const short_doc = 'Creates a hello world';
export const long_doc = 'Creates a hello world';

// the configuration...
export const init = {
  message : ''
}