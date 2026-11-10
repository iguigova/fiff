// The checks on the C# original's recorded output, and in ordered mode the
// smallest diff: `npm run original`. Its failures are the original's
// defects, which the README states.

import { judge, recorded } from './judge.js';
import { strict } from './check.js';

judge('csharp', recorded, strict);
