from databutton_app import router
import databutton as db
from fastapi import HTTPException
from pydantic import BaseModel
from langchain_community.retrievers import TavilySearchAPIRetriever
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_groq import ChatGroq
import os

# Retrieve necessary API keys from db.secrets
TAVILY_API_KEY = db.secrets.get("TAVILY_API_KEY")
GROQ_API_KEY = db.secrets.get("GROQ_API_KEY")

# Set the API keys in the environment
os.environ["TAVILY_API_KEY"] = TAVILY_API_KEY
os.environ["GROQ_API_KEY"] = GROQ_API_KEY


class QueryRequest(BaseModel):
    question: str


class QueryResponse(BaseModel):
    answer: str


@router.post("/query")
def query_endpoint(body: QueryRequest) -> QueryResponse:
    # Initialize the TavilySearchAPIRetriever
    tavily_retriever = TavilySearchAPIRetriever(k=3)

    # Set up the chatbot chain
    prompt = ChatPromptTemplate.from_template(
        """Answer the question based only on the context provided.\n\nContext: {context}\n\nQuestion: {question}"""
    )
    chain = (
        RunnablePassthrough.assign(context=(lambda x: x["question"]) | tavily_retriever)
        | prompt
        | ChatGroq(temperature=0, model_name="mixtral-8x7b-32768", groq_api_key=GROQ_API_KEY)
        | StrOutputParser()
    )

    # Execute the chain with the provided question
    try:
        response = chain.invoke({"question": body.question})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return QueryResponse(answer=response)
