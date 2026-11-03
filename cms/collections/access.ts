// This prototype deliberately allows everyone to manage content.
export const anyone = () => true;
export const publicContentAccess = {
  create: anyone,
  read: anyone,
  update: anyone,
  delete: anyone,
};
