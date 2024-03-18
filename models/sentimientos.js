import { pipeline} from 'transformers';

document.getElementById("sendButton").addEventListener("click", async () => {
    const inputText = document.getElementById("inputText").value;
    const resultContainer = document.getElementById("result");

    const result = await analyzeSentiment(inputText);

    resultContainer.innerHTML = `<div class="result-item">Sentimiento: <span>${result.label}</span></div>
                                 <div class="result-item">Puntuación: <span>${result.score}</span></div>`;

    resultContainer.style.display = 'block';
});

async function analyzeSentiment(text) {
    const pipe = await pipeline('sentiment-analysis','Xenova/bert-base-multilingual-uncased-sentiment')

    const result = await pipe(text)

    console.log(result)
    
    return result[0]
}
