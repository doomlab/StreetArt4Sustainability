import {writeFileSync} from "node:fs";
import {join} from "node:path";

const filePath = join(process.cwd(), "docs", ".nojekyll");
writeFileSync(filePath, "", { flag: "w" });
