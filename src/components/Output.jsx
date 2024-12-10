import { Box, useToast } from '@chakra-ui/react'
import { React, useState } from 'react'
import { Button, Text } from '@chakra-ui/react'
import CodeEditor from './CodeEditor'
import { executeCode } from '../Api'

const Output = ({editorRef, language}) => {
    const toast = useToast();
    const [output, setoutput] = useState(null);
    const [isLoading, setisLoading] = useState(false);
    const [isError, setisError] = useState(false)

    const runCode = async () => {
        const sourceCode = editorRef.current.getValue();
        // console.log(sourceCode);
        if(!sourceCode) return;
        try{
            setisLoading(true);
            const {run: result} = await executeCode(language, sourceCode)
            setoutput(result.output.split("\n"));
            result.stderr ? setisError(true) : setisError(false);

        }
        catch(error){
            console.log(error);
            toast({
                title: "An error occurred",
                description: error.message || "unable to run code",
                status: "error",
                duration: 6000
            })

        }
        finally{
            setisLoading(false);
        }

      
    }
    
  return (
    <Box w='50%'>
        <Text mb ={2} fontSize='2xl' >Output</Text>
        <Button isLoading={isLoading} onClick={runCode} variant = 'outline' fontSize={"2xl"}  py={6}
        colorScheme = "green" 
        >Run Code</Button>

        <Box
        height='85vh'
        p={2}
        color={isError ? "red.400" : ""}
        border = '1px solid'
        borderRadius={4}
        borderColor={
            isError ? "red.500" : "#333"
        }
        >
            {output ? 
                output.map((line, index)=>
                    <Text key={index}> {line} </Text>

                )

            
            : "Click run code to see the output"}
        </Box>
    
    </Box>
  )
}

export default Output
