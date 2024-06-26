import AppLayout from '@/components/Layouts/AppLayout'
import laravelAxios from '@/lib/laravelAxios'
import {
    Box,
    Button,
    ButtonGroup,
    Card,
    CardContent,
    Container,
    Fab,
    Grid,
    IconButton,
    Modal,
    Rating,
    TextareaAutosize,
    Tooltip,
    Typography,
} from '@mui/material'
import axios from 'axios'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import StarIcon from '@mui/icons-material/Star'
import { useAuth } from '@/hooks/auth'
import Link from 'next/link'
import FavoriteIcon from '@mui/icons-material/Favorite'

const Detail = ({ detail, media_type, media_id }) => {
    const [reviews, setReviews] = useState([])
    const [open, setOpen] = useState(false)
    const [rating, setRating] = useState(0)
    const [review, setReview] = useState('')
    const [averageRating, setAverageRating] = useState(null)
    const { user } = useAuth({ middleware: 'auth' })
    const [editMode, setEditMode] = useState(null)
    const [editedRating, setEditedRating] = useState(null)
    const [editedContent, setEditedContent] = useState('')
    const [isFavorited, setIsFavorited] = useState(false)

    const handleReviewAdd = async () => {
        setOpen(false)

        try {
            const response = await laravelAxios.post('api/reviews', {
                content: review,
                rating,
                media_type,
                media_id,
            })

            const updateReviews = [...reviews, response.data]

            setReviews(updateReviews)
            setReview('')
            setRating(0)

            updateAverageRating(updateReviews)
        } catch (err) {
            console.log(err)
        }
    }

    const updateAverageRating = updateReviews => {
        if (updateReviews.length > 0) {
            const totalRating = updateReviews.reduce(
                (acc, review) => acc + review.rating,
                0,
            )

            const average = (totalRating / updateReviews.length).toFixed(1)

            setAverageRating(average)
        } else {
            setAverageRating(null)
        }
    }

    const handleDelete = async id => {
        if (!window.confirm('レビューを削除してもよろしいですか？')) return

        try {
            await laravelAxios.delete(`api/review/${id}`)

            const filteredReviews = reviews.filter(review => review.id !== id)

            setReviews(filteredReviews)

            updateAverageRating(filteredReviews)
        } catch (err) {
            console.log(err)
        }
    }

    const handleEdit = review => {
        setEditMode(review.id)
        setEditedRating(review.rating)
        setEditedContent(review.content)
    }

    const handleConfirmEdit = async reviewId => {
        try {
            const response = await laravelAxios.put(`api/review/${reviewId}`, {
                content: editedContent,
                rating: editedRating,
            })

            setEditMode(null)

            const updatedReview = response.data

            const updatedReviews = reviews.map(review => {
                if (review.id !== reviewId) return review

                return {
                    ...review,
                    content: updatedReview.content,
                    rating: updatedReview.rating,
                }
            })

            setReviews(updatedReviews)
        } catch (err) {
            console.log(err)
        }
    }

    const handleToggleFavorite = async () => {
        try {
            const response = await laravelAxios.post('api/favorites', {
                media_type,
                media_id,
            })

            setIsFavorited(response.data.status === 'added')
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const [reviewResponse, favoriteResponse] = await Promise.all([
                    laravelAxios.get(`api/reviews/${media_type}/${media_id}`),
                    laravelAxios.get('api/favorites/status', {
                        params: {
                            media_type,
                            media_id,
                        },
                    }),
                ])

                const fetchReviews = reviewResponse.data

                setReviews(fetchReviews)
                setIsFavorited(favoriteResponse.data)

                updateAverageRating(fetchReviews)
            } catch (err) {
                console.log(err)
            }
        }

        fetchReviews()
    }, [media_type, media_id])

    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Detail
                </h2>
            }>
            <Head>
                <title>Laravel - Detail</title>
            </Head>

            <Box
                sx={{
                    height: {
                        xs: 'auto',
                        md: '70vh',
                    },
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                }}>
                <Box
                    sx={{
                        backgroundImage: `url(https://image.tmdb.org/t/p/original/${detail.backdrop_path})`,
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                />

                <Container sx={{ zIndex: 1 }}>
                    <Grid
                        sx={{ color: 'white' }}
                        container
                        alignItems={'center'}>
                        <Grid
                            item
                            md={4}
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}>
                            <img
                                width={'70%'}
                                src={`https://image.tmdb.org/t/p/original/${detail.poster_path}`}
                                alt=""
                            />
                        </Grid>

                        <Grid item md={8}>
                            <Typography variant="h4" paragraph>
                                {detail.title || detail.name}
                            </Typography>

                            <IconButton
                                onClick={handleToggleFavorite}
                                style={{
                                    color: isFavorited ? 'red' : 'white',
                                    background: '#0d253f',
                                }}>
                                <FavoriteIcon />
                            </IconButton>

                            <Typography paragraph>{detail.overview}</Typography>

                            <Box
                                gap={2}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 2,
                                }}>
                                <Rating
                                    readOnly
                                    precisiton={0.5}
                                    value={parseFloat(averageRating)}
                                    emptyIcon={
                                        <StarIcon style={{ color: 'white' }} />
                                    }
                                />

                                <Typography
                                    sx={{
                                        ml: 1,
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                    }}>
                                    {averageRating}
                                </Typography>
                            </Box>

                            <Typography variant="h6">
                                {media_type == 'movie'
                                    ? `公開日:${detail.release_date}`
                                    : `初回放送日:${detail.first_air_date}`}
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            <Container sx={{ py: 4 }}>
                <Typography
                    component={'h1'}
                    variant="h4"
                    align="center"
                    gutterBottom>
                    レビュー一覧
                </Typography>

                <Grid container spacing={3}>
                    {reviews.map(review => (
                        <Grid item xs={12} key={review.id}>
                            <Card>
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        component={'div'}
                                        gutterBottom>
                                        {review.user.name}
                                    </Typography>

                                    {editMode === review.id ? (
                                        <>
                                            <Rating
                                                value={editedRating}
                                                onChange={(e, newValue) =>
                                                    setEditedRating(newValue)
                                                }
                                            />

                                            <TextareaAutosize
                                                minRows={3}
                                                style={{ width: '100%' }}
                                                value={editedContent}
                                                onChange={e =>
                                                    setEditedContent(
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <Rating
                                                value={review.rating}
                                                readOnly
                                            />

                                            <Link
                                                href={`/detail/${media_type}/${media_id}/review/${review.id}`}>
                                                <Typography
                                                    variant="body2"
                                                    color="textSecondary"
                                                    paragraph>
                                                    {review.content}
                                                </Typography>
                                            </Link>
                                        </>
                                    )}

                                    {user?.id === review.user.id && (
                                        <Grid
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'flex-end',
                                            }}>
                                            {editMode === review.id ? (
                                                <Button
                                                    onClick={() =>
                                                        handleConfirmEdit(
                                                            review.id,
                                                        )
                                                    }
                                                    disabled={
                                                        !editedRating ||
                                                        !editedContent.trim()
                                                    }>
                                                    編集確定
                                                </Button>
                                            ) : (
                                                <ButtonGroup>
                                                    <Button
                                                        onClick={() =>
                                                            handleEdit(review)
                                                        }>
                                                        編集
                                                    </Button>
                                                    <Button
                                                        color="error"
                                                        onClick={() =>
                                                            handleDelete(
                                                                review.id,
                                                            )
                                                        }>
                                                        削除
                                                    </Button>
                                                </ButtonGroup>
                                            )}
                                        </Grid>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            <Box
                sx={{
                    position: 'fixed',
                    bottom: '16px',
                    right: '16px',
                    zIndex: 5,
                }}>
                <Tooltip title="レビュー追加">
                    <Fab
                        style={{
                            background: '#1976d2',
                            color: 'white',
                        }}
                        onClick={() => setOpen(true)}>
                        <AddIcon />
                    </Fab>
                </Tooltip>
            </Box>

            <Modal open={open} onClose={() => setOpen(false)}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        border: '2px solid, #000',
                        boxShadow: 24,
                        p: 4,
                    }}>
                    <Typography variant="h6" component="h2">
                        レビューを書く
                    </Typography>

                    <Rating
                        required
                        onChange={(e, newValue) => setRating(newValue)}
                        value={rating}
                    />

                    <TextareaAutosize
                        required
                        minRows={5}
                        placeholder="レビュー内容"
                        style={{ width: '100%', marginTop: '10px' }}
                        onChange={e => setReview(e.target.value)}
                        value={review}
                    />

                    <Button
                        variant="outlined"
                        disabled={!rating || !review.trim()}
                        onClick={handleReviewAdd}>
                        送信
                    </Button>
                </Box>
            </Modal>
        </AppLayout>
    )
}

//SSR
export async function getServerSideProps(context) {
    const { media_type, media_id } = context.params

    try {
        const jPResponse = await axios.get(
            `https://api.themoviedb.org/3/${media_type}/${media_id}?api_key=${process.env.TMDB_API_KEY}&language=ja-JP`,
        )

        let combinedData = { ...jPResponse.data }

        if (!jPResponse.data.overview) {
            const enResponse = await axios.get(
                `https://api.themoviedb.org/3/${media_type}/${media_id}?api_key=${process.env.TMDB_API_KEY}&language=en-US`,
            )
            combinedData.overview = enResponse.data.overview
        }

        return {
            props: { detail: combinedData, media_type, media_id },
        }
    } catch {
        return { notFound: true }
    }
}

export default Detail
