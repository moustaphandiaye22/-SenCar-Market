export const TYPE_CONVERSATION_VALUES = ['DIRECT', 'GROUP'] as const;
export type TypeConversation = (typeof TYPE_CONVERSATION_VALUES)[number];

export const TYPE_MESSAGE_VALUES = ['TEXTE', 'IMAGE', 'SYSTEM'] as const;
export type TypeMessage = (typeof TYPE_MESSAGE_VALUES)[number];
