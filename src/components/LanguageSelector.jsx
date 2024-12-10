import { Box, Menu, MenuButton, MenuItem, MenuList, Text, Button } from '@chakra-ui/react'
import React from 'react'
import { LANGUAGAE_VERSIONS } from '../constants';
import { color } from 'framer-motion';
const ACTIVE_COLOR = "blue.400";

const Languages = Object.entries(LANGUAGAE_VERSIONS);

const LanguageSelector = ({language, onSelect}) => {
    return (
        <Box ml={2} mb={4}>
            <Text mb={2} fontSize="2xl" >Language</Text>
            <Menu isLazy>
                <MenuButton as={Button} fontSize={"xl"} py={6}>
                    {language}
                </MenuButton>
                <MenuList bg={'#110c1b'}>
                {Languages.map(([lang, version]) => (
                    <MenuItem key={lang}
                    color={
                        lang === language ? "ACTIVE_COLOR" : ""
                    }
                    bg={
                        lang === language ? "gray.900" : "transparent"
                    }
                    _hover={{
                        color: ACTIVE_COLOR,
                        bg: "gray.900"
                    }}
                    onClick={() => { onSelect(lang)}}>{lang}
                    &nbsp;
                    <Text as="span" color="gray.500" fontSize="sm" >({version})</Text>

                    </MenuItem>
                    ))}


                </MenuList>
            </Menu>
        </Box>
    )
}

export default LanguageSelector
