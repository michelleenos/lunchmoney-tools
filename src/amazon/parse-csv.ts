import Papa from 'papaparse'
import fs from 'fs/promises'

export const parseCsv = async <T = unknown>(filePath: string) => {
    let file = await fs.readFile(filePath, 'utf8')
    let results = Papa.parse<T>(file, {
        header: true,
        skipEmptyLines: true,
    })

    if (results.errors.length > 0) {
        for (const error of results.errors) {
            console.error(`Error parsing CSV at line ${error.row}: ${error.message}`)
        }
        throw new Error(`CSV parsing failed with ${results.errors.length} errors.`)
    }

    return results.data as T[]
}
