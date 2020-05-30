import withSession from "../utils/session";
import CreateNewRoom from "../components/CreateNewRoom";
// import {ShogitterWithoutDnDWrapper} from "shogitter-react";

const HomePage = () => <>
    <h1>Welcome to Shogitter alpha!</h1>
    <CreateNewRoom />
    {/*<ShogitterWithoutDnDWrapper />*/}
</>;
  
export default HomePage;

export const getServerSideProps = withSession(async function(ctx) {
    const {req, res} = ctx;
    const userId = req.session.get("user_id");
    return {props: {userId}};
});
