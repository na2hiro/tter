import withSession from "../utils/session";
import CreateNewRoom from "../components/CreateNewRoom";
import LocalStorageBackedShogitter from "../components/LocalStorageBackedShogitter";

const HomePage = () => <>
    <h1>Welcome to Shogitter alpha!</h1>

    <p>Shogitter alpha is a playground where you can play various shogi rules.</p>

    <p>Try:</p>
    <LocalStorageBackedShogitter />

    <p>
        Click <CreateNewRoom /> to share and play with friends
    </p>
</>;
  
export default HomePage;

export const getServerSideProps = withSession(async function(ctx) {
    const {req, res} = ctx;
    const userId = req.session.get("user_id");
    return {props: {userId}};
});
