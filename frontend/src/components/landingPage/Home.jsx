import React from "react";
import { Carousel } from "flowbite-react";
import pic1 from "../../assets/pic1.png"
import img2 from "../../assets/img2.png"

const Home = () => {
    return (
        <div id="home" className="bg-[#F5F7FA]">
            <div style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem"}} className=" max-w-screen mx-auto min-h-screen h-screen">

            <Carousel className="w-full  mx-auto">
                    <div className="my-28 md:my-8 py-12 flex flex-col md:flex-row-reverse items-center justify-between gap-12">
                        <div>
                            <img src={pic1} alt="" className="w-30 md:w-20 lg:w-130" />
                        </div>

                        {/* hero text */}
                        <div className="md:w-1/2">
                            <h1 style={{marginBottom: "1.5rem"}}className="text-5xl font-semibold mb-4 text-[#4D4D4D] md:w-3/4 landing-snug">Redefining Work,<br></br><span className="text-[#4CAF4F] leading-snug">One Click at a Time!</span></h1>
                            <p  style={{marginBottom: "1.5rem"}}className="text-[#4D4D4D] text-base mb-8">Streamline your tasks, connect effortlessly, and thrive—wherever you are.</p>
                            <button className="btn-primary {{style}} h-10 w-60 bg-[#4CAF4F] text-white rounded hover:bg-[#4D4D4D] transition-all duration-300 hover:-translate-y-4">Sign in with your work email</button>
                        
                        </div>
                        </div>


                        <div className="my-28 md:my-8 py-12 flex flex-col md:flex-row-reverse items-center justify-between gap-12">
                        <div>
                            <img src={img2} alt="" className="w-30 md:w-30 lg:w-180" />
                        </div>

                        {/* hero text */}
                        <div className="md:w-1/2">
                            <h1 style={{marginBottom: "1.5rem"}}className="text-5xl font-semibold mb-4 text-[#4D4D4D] md:w-3/4 landing-snug">Revolutionizing Collaboration,<br></br><span className="text-[#4CAF4F] leading-snug">One Click at a Time!</span></h1>
                            <p  style={{marginBottom: "1.5rem"}}className="text-[#4D4D4D] text-base mb-8">Bringing teams together, no matter the distance—because work should just flow.</p>
                            <button className="btn-primary {{style}} h-10 w-60 bg-[#4CAF4F] text-white rounded hover:bg-[#4D4D4D] transition-all duration-300 hover:-translate-y-4">Sign in with your work email</button>
                        
                        </div>
                        </div>


            </Carousel>

            </div>
        </div>
    )
}

export default Home;