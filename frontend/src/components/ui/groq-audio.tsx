import React, { useState, useRef } from 'react';
import { Groq } from 'groq-sdk';

const AudioTranscription: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioFile(new File([audioBlob], 'recorded_audio.wav', { type: 'audio/wav' }));
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async () => {
    if (!audioFile) {
      console.error('No audio file selected');
      return;
    }

    console.log(process.env.GROQ_API_KEY)

    try {
      const client = new Groq({ apiKey: '', dangerouslyAllowBrowser: true });

      console.log(audioFile);

      const transcriptionResponse = await client.audio.transcriptions.create({
        file: audioFile,
        model: "distil-whisper-large-v3-en",
        response_format: "json",
        language: "en",
        temperature: 0.0,
      });

      setTranscription(transcriptionResponse.text || '');
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setTranscription('Error transcribing audio. Please try again.');
    }
  };

  return (
    <div>
      <h1>Audio Transcription</h1>
      
      {/* Record Audio */}
      <div>
        <h2>Record Audio</h2>
        <button onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>

      {/* Transcribe Button */}
      <button onClick={transcribeAudio} disabled={!audioFile}>
        Transcribe Audio
      </button>

      {/* Display Transcription */}
      <div>
        <h2>Transcription:</h2>
        <p>{transcription}</p>
      </div>
    </div>
  );
};

export default AudioTranscription;