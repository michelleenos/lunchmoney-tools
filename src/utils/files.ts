import fs from 'fs/promises'

export const writeJson = async (dir: string, fileName: string, data: any) => {
    await fs.mkdir(dir, { recursive: true })
    const filePath = `${dir}/${fileName}`
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

export type WriteFilesOpt = boolean | string

export const getDataFilesDir = (writeFiles: WriteFilesOpt): string => {
    if (typeof writeFiles === 'string') {
        return writeFiles
    }
    return `.lm-tools-data`
}
