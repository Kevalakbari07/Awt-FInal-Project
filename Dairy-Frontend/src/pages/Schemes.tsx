import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { apiCall } from "../utils/apiClient"

import doctorImg from "../assets/schemes/Veterinary Doctor Support.png"
import feedImg from "../assets/schemes/Cattle Feed Support.png"
import equipmentImg from "../assets/schemes/Milk Collection Equipment Distribution.png"
import paymentImg from "../assets/schemes/10-Day Payment System.png"
import bonusImg from "../assets/schemes/Annual Bonus Scheme.png"

import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination, Navigation, EffectCoverflow } from "swiper/modules"

import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import "swiper/css/effect-coverflow"

function Schemes() {

    // Static schemes array - unchanged
    const schemes = [

        {
            title: "Veterinary Doctor Support",
            desc: "Free veterinary doctor services for cattle treatment.",
            img: doctorImg
        },

        {
            title: "Cattle Feed Support",
            desc: "Subsidized cattle feed for better milk production.",
            img: feedImg
        },

        {
            title: "Milk Collection Equipment",
            desc: "Farmers receive milk cans and drums.",
            img: equipmentImg
        },

        {
            title: "10 Day Payment System",
            desc: "Milk bills are paid every 10 days.",
            img: paymentImg
        },

        {
            title: "Annual Bonus Scheme",
            desc: "High milk producers receive yearly bonus.",
            img: bonusImg
        }

    ]

    // Database schemes
    const [dbSchemes, setDbSchemes] = useState<any[]>([])

    // Fetch schemes from backend on component load
    useEffect(() => {
        fetchSchemesFromDB()
    }, [])

    const fetchSchemesFromDB = async () => {
        try {
            const response = await apiCall("/schemes")
            if (!response.ok) throw new Error("Failed to fetch schemes")
            const data = await response.json()
            const mappedSchemes = Array.isArray(data) ? data.map((item: any) => ({
                _id: item._id,
                title: item.title || item.name,
                desc: item.desc || item.description,
                img: item.img || item.image || doctorImg // Fallback to default image
            })) : []
            setDbSchemes(mappedSchemes)
            console.log("✅ Schemes loaded:", mappedSchemes)
        } catch (error) {
            console.error("Error fetching schemes from DB:", error)
            setDbSchemes([])
        }
    }

    // Combine static schemes with database schemes
    const allSchemes = [...schemes, ...dbSchemes]

    return (

        <div>

            <Sidebar />

            <div style={{ marginLeft: "250px", transition: "all 0.3s ease" }}>

                <Header />

                <div className="container mt-4">

                    <h2 className="text-center fw-bold mb-4">
                        Farmer Welfare Schemes
                    </h2>

                    <Swiper
                        modules={[Autoplay, Pagination, Navigation, EffectCoverflow]}
                        effect="coverflow"
                        grabCursor={true}
                        centeredSlides={true}
                        slidesPerView={1}

                        autoplay={{
                            delay: 3500,
                            disableOnInteraction: false
                        }}

                        pagination={{ clickable: true }}

                        navigation={true}

                        coverflowEffect={{
                            rotate: 20,
                            stretch: 0,
                            depth: 120,
                            modifier: 1,
                            slideShadows: true
                        }}

                        style={{ paddingBottom: "40px" }}
                    >

                        {allSchemes.map((scheme, index) => (

                            <SwiperSlide key={scheme._id || index}>

                                <div
                                    className="shadow-lg"
                                    style={{
                                        borderRadius: "15px",
                                        overflow: "hidden",
                                        maxWidth: "1000px",
                                        margin: "0 auto"
                                    }}
                                >

                                    <img
                                        src={scheme.img}
                                        style={{
                                            width: "100%",
                                            height: "auto",
                                            display: "block"
                                        }}
                                    />

                                    <div className="p-4 text-center bg-white">

                                        <h4 className="fw-bold">
                                            {scheme.title}
                                        </h4>

                                        <p className="text-muted">
                                            {scheme.desc}
                                        </p>

                                    </div>

                                </div>

                            </SwiperSlide>

                        ))}

                    </Swiper>

                </div>

            </div>

        </div>

    )
}

export default Schemes
