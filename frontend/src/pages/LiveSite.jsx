import { useEffect, useState } from "react";
import { serverUrl } from "../App";
import { useParams } from "react-router-dom";
import axios from "axios";

function LiveSite() {
  const { slug } = useParams(); // ← changed from id to slug
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleGetWebsite = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/website/get-by-slug/${slug}`,
          { withCredentials: true },
        );
        setHtml(result.data.latestCode);
      } catch (error) {
        console.log(error);
        setError("Site not found");
      } finally {
        setLoading(false);
      }
    };
    handleGetWebsite();
  }, [slug]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white text-sm">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        {error}
      </div>
    );
  }

  return (
    <iframe
      title="Live Site"
      srcDoc={html}
      className="w-screen h-screen border-none"
      sandbox="allow-scripts allow-same-origin allow-forms"
    />
  );
}

export default LiveSite;
