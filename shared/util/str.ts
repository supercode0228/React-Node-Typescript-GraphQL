import { map } from "d3"

export const maybeSplitLine = (line : string, maxLen = 25) => {
  // Is there're line breaks - split and treat each line separately
  if(line.indexOf('\n') >= 0) {
    return Array.prototype.concat(
      ...line
        .split('\n')
        .map(l => module.exports.maybeSplitLine(l, maxLen))
    )
  }
  let lineParts = []
  if(line && line.length > maxLen) {
    let parts = line.split(' ')
      .map(p => {
        if(p.length <= maxLen + 1)
          return [p];
        let wordParts = p.match(new RegExp(`.{1,${maxLen}}`,"g"));
        if(wordParts == null)
          return [];
        return wordParts.map((wp, i) => (i < (wordParts?.length || 0) - 1) ? `${wp}-` : wp);
      })
      .reduce((a, b) => [ ...a, ...b ], []);
    let tparts : string[] = [],
        tlen = 0
    parts.forEach((p, i) => {
      tparts.push(p)
      tlen += p.length
      if(i < parts.length - 1 && tlen + parts[i+1].length > Math.min(line.length/2, maxLen)) {
        lineParts.push(tparts.join(' '))
        tparts = []
        tlen = 0
      }
    });
    if(tlen > 0) {
      lineParts.push(tparts.join(' '))
    }
  } else {
    lineParts.push(line)
  }
  return lineParts
}

// Ref: https://stackoverflow.com/a/1349426
export const randomStr = (len : number) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( var i = 0; i < len; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const isNullOrEmpty = (s : string | Array<any> | undefined) => {
  return !s || s.length < 1;
}

// Ref: https://stackoverflow.com/a/1129270
export const strCompare = (a : string, b : string, order : number) => {
  if ( a < b ){
    return -1 * order;
  }
  if ( a > b ){
    return 1 * order;
  }
  return 0;
};

export const maybeClipStr = (s : string | undefined, maxLen : number) => {
  if(!s)
    return s;
  return s.length <= maxLen ? s : `${(s.substr(0, maxLen - 3))}...`;
}
