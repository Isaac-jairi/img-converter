'use client'

import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { ChangeEvent, useRef, useState } from 'react'

const supportedTypes = ["image/jpg", "image/jpeg", "image/png", "image/gif", "image/bmp", "image/x-icon", "image/tiff"];
const conversionFormats = ["jpg", "jpeg", "png", "gif", "bmp", "ico", "tif", "tiff"];

type FileWithFormat = {
  file: File;
  format: string;
};



export default function Home() {
  const [loaded, setLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [fileList, setFileList] = useState<FileWithFormat[]>([]);
  const [isConverting, setIsConverting] = useState(false);

  const ffmpegRef = useRef(new FFmpeg())
  const ffmpeg = ffmpegRef.current


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file && supportedTypes.includes(file.type)) {
      setFileList((prevList) => [
        ...prevList,
        { file, format: conversionFormats[0] },
      ]);
    } else {
      alert("Por favor, selecione um arquivo de imagem válido.");
    }
  };

  const handleFormatChange = (index: number, newFormat: string) => {
    setFileList((prevList) =>
      prevList.map((item, i) =>
        i === index ? { ...item, format: newFormat } : item
      )
    );
  };


  const load = async () => {
    setIsLoading(true)
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
    const ffmpeg = ffmpegRef.current
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
    })
    setLoaded(true)
    setIsLoading(false)
  }

  const handleConvert = async () => {      
    
    setIsConverting(true);

    for (const fileItem of fileList) {
      const { file, format } = fileItem;
      const fileName = file.name.split(".")[0];
      const inputPath = file.name;
      const outputPath = `${fileName}.${format}`;

      ffmpeg.writeFile( inputPath, await fetchFile(file));

      await ffmpeg.exec(["-i", inputPath, outputPath]);

      const data = (await ffmpeg.readFile(outputPath)) as any

      const url = URL.createObjectURL(new Blob([data.buffer], { type: `image/${format}` }));


      const link = document.createElement("a");
      link.href = url;
      link.download = outputPath;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    }

    setIsConverting(false);
  };


  return (
    <div className="grid  items-center justify-items-center mt-20">
      <div className="flex flex-col justify-center align-middle items-center">
        <h1 className="text-2xl">Conversor de Imagens</h1>
        <p>Este conversor foi desenvolvido como trabalho final da disciplina de <strong>Sistemas Multimídia</strong>.</p>
        <p>É uma implementação da biblioteca FFmpeg para conversão de imagens </p>
      </div>



{!loaded ? (
  <button
      className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
      onClick={load}
      >
      Iniciar
      {isLoading && (
        <span className="animate-spin ml-3">
          <svg
            viewBox="0 0 1024 1024"
            focusable="false"
            data-icon="loading"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
            >
            <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path>
          </svg>
        </span>
      )}
    </button>):(
<div className="p-4">
      <label
        htmlFor="fileInput"
        className="px-4 py-2 text-white bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600"
      >
        Selecione um arquivo
      </label>
      <input
        id="fileInput"
        type="file"
        className="hidden"
        accept={supportedTypes.join(",")}
        
        onChange={handleFileChange}
      />

      {fileList.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-around  p-2 border-b border-gray-700 text-white">
            <span className='px-5'>  Nome do arquivo  </span>
            <span className='px-5'>  Converter Para   </span>
          </div>
          {fileList.map((fileItem, index) => (
            <div key={index} className="flex justify-around items-center p-2 border-b border-gray-700">
              <span className="text-white">{fileItem.file.name}</span>
              <select
                className="bg-gray-800 text-white p-1 rounded"
                value={fileItem.format}
                onChange={(e) => handleFormatChange(index, e.target.value)}
              >
                {conversionFormats.map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {fileList.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
            onClick={handleConvert}
            disabled={isConverting}
          >
            {isConverting ? "Convertendo..." : "Converter"}
          </button>
        </div>
      )}
    </div>
    )}
    















    </div>
  );
}
