export const validLeftSiderBarItems = ['Explorer', 'Setting'] as const
export type LeftSiderBarItem = (typeof validLeftSiderBarItems)[number]
