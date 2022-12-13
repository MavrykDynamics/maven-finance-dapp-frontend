export const getLimitedString = ( text: string, limit: number) => {
  if( text.length <= limit) return text;
  text = text.slice( 0, limit);
  text = text.trim();
  return text + "...";
}
