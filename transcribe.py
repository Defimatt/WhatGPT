import openai
import sys
from pydub import AudioSegment

if len(sys.argv) != 3:
    print("Please provide the path to the audio file and API key as command-line arguments")
    sys.exit()

openai.api_key = sys.argv[2]
audio_file_path = sys.argv[1]
wav_file_path = audio_file_path.replace(".ogg", ".wav")

audio = AudioSegment.from_file(audio_file_path, format="ogg")
audio.export(wav_file_path, format="wav")

with open(wav_file_path, "rb") as audio_file:
    transcript = openai.Audio.transcribe("whisper-1", audio_file)
    print(transcript)
