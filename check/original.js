// The checks on the C# original's recorded output: `npm run original`. Its
// failures are the original's defects, which the README states.

import { judge, recorded } from './judge.js';

judge('csharp', recorded);
