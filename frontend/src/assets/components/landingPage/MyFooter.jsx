import React from "react";
import { Footer } from "flowbite-react";
import { BsDribbble, BsFacebook, BsGithub, BsInstagram, BsTwitter } from "react-icons/bs";
import logo from '../../logo.png';
import { MdEmail } from "react-icons/md"; // Import Email Icon




const MyFooter = () => {
    return(
        <Footer container>
      <div className="w-full text-white ">
        <div className=" grid w-full justify-between sm:flex sm:justify-between md:flex md:grid-cols-1">
          <div className="space-y-4 mb-8">
            <a href="/" className="text-2xl font-semibold flex items-center space-x-3">
                        <img src={logo} alt="VirtuTask Logo" className="w-15 inline-[block]" />
                        <span className="text-white">VirtuTask</span>
                      </a>

           <div>
            <p className="mb-1">copyright © 2025 VirtuTask ltd.</p>
            <p>All rights reserved</p>
            
            </div>             
          </div>
          <div className="grid grid-cols-2 gap-8 sm:mt-4 sm:grid-cols-3 sm:gap-6">
            <div>
              <Footer.Title title="about" />
              <Footer.LinkGroup col>
                <Footer.Link href="#">Home</Footer.Link>
                <Footer.Link href="#">Services</Footer.Link>
              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.Title title="Follow us" />
              <Footer.LinkGroup col>
                <Footer.Link href="#">Github</Footer.Link>
                <Footer.Link href="#">Instagram</Footer.Link>
              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.Title title="Legal" />
              <Footer.LinkGroup col>
                <Footer.Link href="#">Privacy Policy</Footer.Link>
                <Footer.Link href="#">Terms &amp; Conditions</Footer.Link>
              </Footer.LinkGroup>
            </div>
          </div>
        </div>
        <Footer.Divider />
                <div className="w-full sm:flex sm:items-center sm:justify-between">
                    <Footer.Copyright href="#" by="Flowbite™" year={2025} />
                    <div className="mt-4 flex items-center space-x-2 sm:mt-0">
                        <MdEmail className="text-xl" /> 
                        <a href="mailto:contact@virtutask.com" className="text-white hover:underline">contact@virtutask.com</a>
                    </div>
                </div>
      </div>
    </Footer>
    )
}

export default MyFooter;