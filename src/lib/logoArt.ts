/**
 * The VENA logo artwork, in the supplied 2000×2000 coordinates: white geometric letters on
 * near-black, two faint grey shapes behind the E and N, and roots growing from the foot of the N.
 * Letters and shapes are a precise redraw; the roots are a hand-drawn approximation of the
 * supplied ones. Shared by the React logo and the icon generator so they always match.
 */
export const LOGO_BG = '#0A0B0A'
export const LOGO_SHADE = '#141515'

export const LOGO_SHAPES = [
  [582, 758, 922, 758, 922, 983, 582, 983], // shade behind the E
  [1190, 1045, 1443, 1450, 965, 1460], // shade behind the N
]

export const LOGO_LETTERS = [
  [33, 733, 60, 733, 243, 1238, 416, 758, 115, 758, 115, 733, 453, 733, 243, 1310], // V
  [548, 733, 910, 733, 885, 758, 573, 758, 573, 1284, 892, 1284, 892, 1309, 548, 1309], // E
  [623, 983, 843, 983, 843, 1007, 599, 1007], // E bar
  [1021, 733, 1050, 733, 1358, 1265, 1358, 733, 1382, 733, 1382, 1309, 1359, 1309, 1046, 775, 1046, 1309, 1021, 1309], // N
  [1688, 733, 1898, 1309, 1560, 1309, 1560, 1284, 1862, 1284, 1688, 804, 1505, 1309, 1479, 1309], // A
  [1021, 1309, 1046, 1309, 1044, 1358, 1052, 1368, 1014, 1368, 1023, 1358], // root trunk under the N
]

/** Roots as stroked lines: [stroke width, x1, y1, x2, y2, …]. Thicker near the trunk, thinner at the tips. */
export const LOGO_ROOTS: number[][] = [
  // Left: the long surface root, then two that dive down.
  [7, 1022, 1366, 990, 1370, 955, 1373, 925, 1381, 890, 1386, 860, 1384, 835, 1389, 810, 1388, 790, 1391],
  [3, 860, 1384, 849, 1397, 843, 1408],
  [3, 890, 1386, 875, 1397, 860, 1404],
  [2.5, 935, 1379, 950, 1388],
  [5, 1018, 1372, 1000, 1386, 985, 1405, 960, 1418, 935, 1427, 920, 1431],
  [2.5, 985, 1405, 976, 1424, 968, 1436],
  [2.5, 960, 1418, 946, 1439],
  [2.5, 1000, 1386, 990, 1401],
  [4, 1025, 1375, 1015, 1401, 1005, 1429, 990, 1449, 975, 1458],
  [2.5, 1005, 1429, 1012, 1446],
  // Right: mirror-ish, as in the artwork.
  [7, 1046, 1366, 1080, 1370, 1120, 1374, 1150, 1381, 1185, 1385, 1215, 1392, 1245, 1390, 1280, 1388],
  [2.5, 1150, 1381, 1168, 1376],
  [3, 1215, 1392, 1230, 1401, 1242, 1404],
  [2.5, 1185, 1385, 1196, 1396],
  [5, 1048, 1372, 1065, 1385, 1085, 1400, 1110, 1415, 1130, 1430, 1150, 1441],
  [2.5, 1085, 1400, 1095, 1420, 1100, 1435],
  [2.5, 1110, 1415, 1118, 1440],
  [2.5, 1130, 1430, 1146, 1425],
  [4, 1042, 1376, 1052, 1400, 1062, 1425, 1072, 1445, 1085, 1458],
  [2.5, 1062, 1425, 1052, 1440],
  // The tap root going straight down, with side twigs.
  [6, 1034, 1368, 1036, 1400, 1033, 1430, 1028, 1455, 1036, 1480],
  [3.5, 1036, 1480, 1046, 1500, 1042, 1525, 1035, 1548, 1033, 1572],
  [2.5, 1028, 1455, 1015, 1470, 1010, 1482],
  [2.5, 1046, 1500, 1058, 1515, 1068, 1530],
  [2.5, 1036, 1480, 1022, 1500, 1020, 1512],
  [2, 1042, 1525, 1052, 1545],
  [2, 1035, 1548, 1022, 1557],
]

const pointsToPath = (p: number[], close: boolean) =>
  p.reduce((d, v, i) => d + (i % 2 === 0 ? `${i === 0 ? 'M' : 'L'}${v}` : ` ${v}`), '') + (close ? 'Z' : '')

export const polygonPath = (p: number[]) => pointsToPath(p, true)
export const linePath = (p: number[]) => pointsToPath(p, false)
