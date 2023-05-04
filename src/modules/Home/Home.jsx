import React, { useEffect, useRef, useState } from 'react'
import styles from './Home.module.scss';
import { IoIosMenu } from 'react-icons/io'
import { MdSearch, MdSend } from 'react-icons/md'
import { BiArrowBack } from 'react-icons/bi'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { auth, db, sendMessage, getUsersWithEmail, getUsersByIds } from '../../firebase';
import { and, collection, onSnapshot, or, orderBy, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const Menu = ({ refContainer, isMenuOpen, setIsMenuOpen }) => {
    const [cssProperties, setCssProperties] = useState({})
    const handleLogout = () => {
        signOut(auth);
    }
    useEffect(() => {
        if (refContainer.current) {
            const { height, left, y } = refContainer.current.getBoundingClientRect();
            setCssProperties({ "--l": left + "px", "--t": y + height + "px" })
        }
    }, [refContainer.current]);
    return (
        <>
            <div onClick={() => setIsMenuOpen(false)} className={`${styles.bgWrapper} ${(isMenuOpen) ? styles.open : ''}`}></div>
            <div className={`${styles.menuContainer} ${(isMenuOpen ? styles.open : '')}`} style={cssProperties}>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </>
    )
}

const Sidebar = ({ setId }) => {
    const [email, setEmail] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchedUsers, setSearchedUsers] = useState([]);
    const [myUsers, setMyUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const menuOpenRef = useRef(null);

    const handleError = (e) => {
        e.target.classList.add(styles.error);
        e.target.parentNode.querySelector("p").style.display = "flex";
        e.target.parentNode.querySelector("p > span").innerText = e.target.alt.slice(0, 1);
    }
    const openChatHandler = async (id) => {
        setEmail('');
        setId(id);
        setSearchedUsers([]);
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const users = await getUsersWithEmail(email);
            setSearchedUsers(users);
            setIsLoading(false)
        } catch (err) {
            console.log(err);
            alert(err.message);
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const messagesDbRef = collection(db, 'messages');
        const q = query(messagesDbRef, or(where("receiverId", "==", auth.currentUser.uid), where("senderId", "==", auth.currentUser.uid)), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id
            }));
            const userIds = Array.from(new Set(messages.map((user) => auth.currentUser.uid === user.receiverId ? user.senderId : user.receiverId)),);
            const getUsers = async (userIds) => {
                try {
                    const users = await getUsersByIds(userIds);
                    setMyUsers(users);
                } catch (err) {
                    console.error(err);
                    alert(err.message);
                }
            }
            getUsers(userIds);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className={styles.sidebarContainer}>
            <div className={styles.top}>
                <div className={styles.left}>
                    <button onClick={() => setIsMenuOpen(true)} ref={menuOpenRef}><IoIosMenu /></button>
                    <Menu refContainer={menuOpenRef} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
                </div>
                <div className={styles.right}>
                    <form action="#" onSubmit={handleSubmit}>
                        <input type="text" placeholder='Add User by Email' value={email} onChange={(e) => setEmail(e.target.value)} />
                    </form>
                    <span className={`${styles.icon} ${isLoading ? styles.loading : ''}`}>{isLoading ? <AiOutlineLoading3Quarters /> : <MdSearch />}</span>
                </div>
            </div>
            <div className={styles.bottom}>
                {
                    email ? searchedUsers.map((user, i) => (
                        <div className={styles.item} key={i} onClick={() => openChatHandler(user.id)}>
                            <div className={styles.left}>
                                <img src={user.photoURL ? user.photoURL : ''} alt={user.name} onError={handleError} />
                                <p><span></span></p>
                            </div>
                            <div className={styles.right}>
                                <p>{user.name}</p>
                                <span>{user.email}</span>
                            </div>
                        </div>
                    ))
                        :
                        myUsers.length > 0 ? myUsers.map((user, i) => (
                            <div className={styles.item} key={i} onClick={() => openChatHandler(user.id)}>
                                <div className={styles.left}>
                                    <img src={user.photoURL ? user.photoURL : ''} alt={user.name} onError={handleError} />
                                    <p><span></span></p>
                                </div>
                                <div className={styles.right}>
                                    <p>{user.name}</p>
                                    <span>{user.email}</span>
                                </div>
                            </div>
                        ))
                            : <p>There is not any chat yet.</p>
                }
            </div>
        </div>
    )
}

const Chat = ({ id, setId, chatContainerRef }) => {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [allMessages, setAllMessages] = useState([]);
    const messagesContainer = useRef();
    const sendMessageHandler = async (e) => {
        e.preventDefault();
        if (isLoading || !message) return;
        try {
            setIsLoading(true);
            await sendMessage(message, id);
            setIsLoading(false);
            setMessage('');
        } catch (err) {
            setIsLoading(false);
            console.log(err);
            alert(err.message);
        }
    }
    useEffect(() => {
        const messagesDbRef = collection(db, 'messages');
        const queryMessages = query(messagesDbRef, or(
            and(
                where('receiverId', "==", auth.currentUser.uid),
                where('senderId', "==", id)
            ),
            and(
                where('senderId', "==", auth.currentUser.uid),
                where('receiverId', "==", id)
            )
        ), orderBy('createdAt'));
        const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
            setAllMessages(snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id
            })))
        })

        return () => unsubscribe();
    }, [id]);

    useEffect(() => {
        const { scrollHeight } = messagesContainer.current;
        console.log(scrollHeight);
        window.scrollTo(0, scrollHeight);
        chatContainerRef.current.scrollTo(0, scrollHeight);
    }, [allMessages]);
    return (
        <div className={styles.chatContainer}>
            <div className={styles.mobileTop}>
                <button onClick={() => setId(null)}><BiArrowBack /></button>
            </div>
            <div className={styles.input}>
                <div className={styles.wrapper}>
                    <form action='#' onSubmit={sendMessageHandler}>
                        <input type="text" placeholder='Message' value={message} onChange={(e) => setMessage(e.target.value)} />
                        <button className={isLoading ? styles.loading : ''} type='submit'>{isLoading ? <AiOutlineLoading3Quarters /> : <MdSend />}</button>
                    </form>
                </div>
            </div>
            <div className={styles.messages} ref={messagesContainer}>
                {
                    allMessages.length > 0 && allMessages.map((message, index) => (
                        <div className={`${styles.message} ${(message.senderId === auth.currentUser.uid) ? styles.me : ''}`} key={index}>
                            <p><span>{message.message}</span><span className={styles.time}>{message?.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></p>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

const Home = ({ user }) => {
    const [id, setId] = useState(null);
    const chatContainerRef = useRef(null);
    return (
        <div className={`${styles.container} ${(id ? styles.open : '')}`}>
            <div className={styles.sidebar} >
                <Sidebar setId={setId} />
            </div>
            <div className={styles.chat} ref={chatContainerRef}>
                {
                    id ? <Chat setId={setId} id={id} chatContainerRef={chatContainerRef} /> : (
                        <div className={styles.center}>
                            <p>No Chat Selected</p>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default Home