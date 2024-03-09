import React, { useState } from 'react';
import { Box, Text, Input, Button, VStack, Divider, useToast } from '@chakra-ui/react';
import brain from 'brain';

const TavilyLangChainUseCase = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [conversation, setConversation] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = () => {
    setConversation(prev => [...prev, `You: ${prompt}`]);
    handleQuery(prompt);
  };

  const handleQuery = async (userInput: string) => {
    try {
      const response = await brain.query_endpoint({ question: userInput });
      if (response.ok) {
        const { answer } = await response.json();
        setConversation(prev => [...prev, `AI: ${answer}`]);
      } else {
        throw new Error('Failed to get response from the AI');
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'There was an error processing your request.',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const toast = useToast();

  return (
    <Box p={5} shadow='md' borderWidth='1px'>
      <Text fontSize='xl' mb={4}>Tavily x LangChain x Groq x MistralAI Use Case</Text>
      <Text fontSize='md' mb={4}>Build the with the power of Retrieval Augment generation</Text>
      <Input
        placeholder='Enter your prompt here...'
        value={prompt}
        onChange={handleInputChange}
        mb={4}
      />
      <Button colorScheme='teal' onClick={handleSubmit}>Send</Button>
      <Divider my={4} />
      <VStack
        overflowY='auto'
        maxH='300px'
        w='100%'
        p={4}
        border='1px'
        borderColor='gray.200'
        borderRadius='md'
        spacing={4}
        align='stretch'
      >
        {conversation.map((msg, index) => (
          <Text key={index} className="prose" p={2} bg='gray.50' borderRadius='md'>
            {msg}
          </Text>
        ))}
      </VStack>
    </Box>
  );
};

export { TavilyLangChainUseCase };
