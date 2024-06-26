import axios from 'axios'

export default async function handler(req, res) {
    const { searchQuery } = req.query

    if (!searchQuery) {
        return res.status(400).json({ message: '検索文字がありません' })
    }

    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/search/multi?api_key=${
                process.env.TMDB_API_KEY
            }&query=${encodeURIComponent(searchQuery)}&language=ja-JP`,
        )
        res.status(200).json(response.data)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'エラーが発生しました' })
    }
}
