import fs from 'fs/promises';
export const writeJson = async (dir, fileName, data) => {
    await fs.mkdir(dir, { recursive: true });
    const filePath = `${dir}/${fileName}`;
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};
export const getDataFilesDir = (writeFiles, defaultSuffix) => {
    if (typeof writeFiles === 'string') {
        return writeFiles;
    }
    return `.data/${Date.now()}-${defaultSuffix}`;
};
