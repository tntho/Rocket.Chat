import { RocketChat } from 'meteor/rocketchat:lib';
import property from 'lodash.property';

import schema from '../../schemas/channels/Channel-type.graphqls';

const resolver = {
	Channel: {
		id: property('_id'),
		name: (root, args, { user }) => {
			if (root.t === 'd') {
				return root.usernames.find(u => u !== user.username);
			}

			return root.name;
		},
		members: (root) => {
			return RocketChat.models.Subscriptions.findByRoomId(root._id, {fields: {u: 1}}).fetch().filter(s => s.u && s.u._id).map(
				s => RocketChat.models.Users.findOneById(s.u._id)
			);
		},
		owners: (root) => {
			// there might be no owner
			if (!root.u) {
				return;
			}

			return [RocketChat.models.Users.findOneByUsername(root.u.username)];
		},
		numberOfMembers: (root) => {
			return RocketChat.models.Subscriptions.findByRoomId(root._id).count();
		},
		numberOfMessages: property('msgs'),
		readOnly: (root) => root.ro === true,
		direct: (root) => root.t === 'd',
		privateChannel: (root) => root.t === 'p',
		favourite: (root, args, { user }) => {
			const room = RocketChat.models.Subscriptions.findOneByRoomIdAndUserId(root._id, user._id);

			return room && room.f === true;
		},
		unseenMessages: (root, args, { user }) => {
			const room = RocketChat.models.Subscriptions.findOneByRoomIdAndUserId(root._id, user._id);

			return (room || {}).unread;
		}
	}
};

export {
	schema,
	resolver
};
