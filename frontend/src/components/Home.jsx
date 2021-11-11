import React, { useEffect, useState } from 'react';
import SearchBar from './SearchBar';
import PhotoGallery from './PhotoGallery';
import { Button, message, Tabs, Row, Col } from 'antd';
import { SEARCH_KEY, TOKEN_KEY } from '../constants';
import http from '../service';
const { TabPane } = Tabs;

const Home = () => {
	const [activeTab, setActiveTab] = useState('image');
	const [posts, setPosts] = useState([]);
	const [searchOption, setSearchOption] = useState({
		type: SEARCH_KEY.all,
		keyword: ''
	});

	useEffect(() => {
		const { type } = searchOption;
		const params = type !== SEARCH_KEY.all ? { [type]: type } : null;
		http
			.get('/search', params, instance => {
				instance.interceptors.request.use(config => {
					config.headers.Authorization = `Bearer ${sessionStorage.getItem(TOKEN_KEY)}`;
					type !== SEARCH_KEY.all && (config.params = { [type]: type });

					return config;
				});
			})
			.then(res => setPosts(res))
			.catch(err => message.error(err));
	}, [searchOption]);

	const renderPost = type => {
		if (!posts || posts.length === 0) {
			return <div>No data!</div>;
		}
		if (type === 'image') {
			const imagesArr = posts
				.filter(item => item.type === 'image')
				.map(item => {
					const { id, url, message, user } = item;
					return {
						postId: id,
						src: url,
						thumbnail: url,
						thumbnailWidth: 300,
						thumbnailHeight: 200,
						caption: message,
						user
					};
				});

			return <PhotoGallery images={imagesArr} />;
		} else if (type === 'video') {
			return (
				<Row gutter={32}>
					{posts
						.filter(item => item.type === 'video')
						.map(item => (
							<Col span={8}>
								<video src={item.url} controls={true} className='video-block'>
									<p>{`${item.user}: ${item.caption}`}</p>
								</video>
							</Col>
						))}
				</Row>
			);
		}
	};

	const operations = <Button>button</Button>;
	return (
		<div>
			<SearchBar />
			<div className='display'>
				<Tabs defaultActiveKey={activeTab} onChange={key => setActiveTab(key)} tabBarExtraContent={operations}>
					<TabPane tab='Images' key='image'>
						{renderPost('image')}
					</TabPane>
					<TabPane tab='Videos' key='video'>
						{renderPost('video')}
					</TabPane>
				</Tabs>
			</div>
		</div>
	);
};

export default Home;
