
const url = process.env.NEXT_PUBLIC_API_URL;


type RequestData = {
    title: string,
    budget: number,
    runtime: number,
    genres: string[],
    releaseDate: Date,
};

export const fetchPrediction = async (requestData: RequestData) => {
    const response = await fetch(`${url}/ml/predict`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
    });

    if (!response.ok) {
        await response.text();
        throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();
    return result;
}
