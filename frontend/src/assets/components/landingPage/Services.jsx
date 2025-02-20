import React from "react";

const Services = () => {
    const Services = [
        {id: 1, title: "Remote and Hybrid Teams", description: "Companies with distributed employees needing seamless collaboration.", image:"/src/assets/remote.png"},
        {id: 2, title: "Startups & Growing Businesses", description: "Teams that need an efficient, scalable workspace without overhead.", image: "/src/assets/startup.png"},
        {id: 3, title: "Freelancers & Consultants", description: "Independent professionals who manage projects and clients remotely.", image: "/src/assets/free.png"}
    
    ]
    return (
        <div id="services" className="md:px-14 px-4 py-1 max-w-screen-2xl mx-auto" >
            <div className="text-center my-8">
                <h2 style={{ marginTop:"6rem", marginBottom: "0.5rem"}}className="text-4xl text-[#4D4D4D] font-semibold mb-2">Unlock the Future of Remote Work!</h2>
                <p className="text-[#717171]">Who is VirtuTask suitable for?</p>
            </div>

            {/* services cards */}
            <div style={{marginTop: "3rem", marginBottom:"4rem"}}className="mt-14 grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 md:w-11/12 mx-auto gap-12">
                {
                    Services.map(service => <div key={service.id} style={{ marginBottom:"3rem" ,marginLeft: "3rem"}} className="px-4 py-8 text-center md:w-[300px]
                    mx-auto md:h-80 rounded-md shadow cursor-pointer hover:-translate-y-5 hover:border-b-4
                    hover:border-indigo-700 transition-all duration-300 flex items-senter justify-center h-full">
                    <div>
                        <div style={{marginLeft: "7rem", marginBottom:"2rem"}}className="bg-[#E8F5E9] mb-4 w-14 h-14 mx-auto rounded-br-3xl"><img src={service.image} style={{marginTop: "3rem"}}alt=""/></div>
                        <h4 style={{marginBottom: "1.5rem"}} className="text-2xl font-bold text-[#4D4D4D] mb-2 px-2">{service.title}</h4>
                        <p className="text-sm text-[#4D4D4D]">{service.description}</p>
                    </div>
                </div>)
                }
            </div>
        </div>

        
    

    );
};

export default Services;